package com.example.boardinghouse.Modules.dashboard;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    @PersistenceContext
    private final EntityManager entityManager;

    public DashboardSummary getSummary(Long userId, boolean isAdmin) {
        if (isAdmin) {
            return DashboardSummary.builder()
                    .buildingsCount((Long) entityManager.createQuery("SELECT COUNT(b) FROM Building b").getSingleResult())
                    .roomsCount((Long) entityManager.createQuery("SELECT COUNT(r) FROM Room r").getSingleResult())
                    .tenantsCount((Long) entityManager.createQuery("SELECT COUNT(u) FROM User u WHERE u.role = 'TENANT'").getSingleResult())
                    .contractsCount((Long) entityManager.createQuery("SELECT COUNT(c) FROM Contract c").getSingleResult())
                    .invoicesCount((Long) entityManager.createQuery("SELECT COUNT(i) FROM Invoice i").getSingleResult())
                    .issuesCount((Long) entityManager.createQuery("SELECT COUNT(i) FROM Issue i").getSingleResult())
                    .servicesCount((Long) entityManager.createQuery("SELECT COUNT(s) FROM SubscriptionPackage s").getSingleResult())
                    .build();
        } else {
            return DashboardSummary.builder()
                    .buildingsCount((Long) entityManager.createQuery("SELECT COUNT(b) FROM Building b WHERE b.landlordId = :userId")
                            .setParameter("userId", userId).getSingleResult())
                    .roomsCount((Long) entityManager.createQuery("SELECT COUNT(r) FROM Room r WHERE r.building.landlordId = :userId")
                            .setParameter("userId", userId).getSingleResult())
                    .tenantsCount((Long) entityManager.createQuery("SELECT COUNT(u) FROM User u WHERE u.landlord.id = :userId AND u.role = 'TENANT'")
                            .setParameter("userId", userId).getSingleResult())
                    .contractsCount((Long) entityManager.createQuery("SELECT COUNT(c) FROM Contract c WHERE c.room.building.landlordId = :userId")
                            .setParameter("userId", userId).getSingleResult())
                    .invoicesCount((Long) entityManager.createQuery("SELECT COUNT(i) FROM Invoice i, Contract c WHERE i.contractId = c.id AND c.room.building.landlordId = :userId")
                            .setParameter("userId", userId).getSingleResult())
                    .issuesCount((Long) entityManager.createQuery("SELECT COUNT(i) FROM Issue i WHERE i.room.building.landlordId = :userId")
                            .setParameter("userId", userId).getSingleResult())
                    .servicesCount((Long) entityManager.createQuery("SELECT COUNT(s) FROM SubscriptionPackage s").getSingleResult()) // Assuming services are global
                    .build();
        }
    }
}
