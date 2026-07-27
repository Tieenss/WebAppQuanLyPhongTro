package com.example.boardinghouse.Modules.subscription;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubscriptionPackageService {

    private final SubscriptionPackageRepository repository;

    @Autowired
    public SubscriptionPackageService(SubscriptionPackageRepository repository) {
        this.repository = repository;
    }

    public List<SubscriptionPackage> getAllPackages() {
        return repository.findAll();
    }

    public SubscriptionPackage getPackageById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription package not found"));
    }

    public SubscriptionPackage createPackage(SubscriptionPackage packageInfo) {
        return repository.save(packageInfo);
    }

    public SubscriptionPackage updatePackage(Long id, SubscriptionPackage updateInfo) {
        SubscriptionPackage existing = getPackageById(id);
        existing.setName(updateInfo.getName());
        existing.setPrice(updateInfo.getPrice());
        existing.setMaxRooms(updateInfo.getMaxRooms());
        existing.setDurationMonths(updateInfo.getDurationMonths());
        existing.setDescription(updateInfo.getDescription());
        return repository.save(existing);
    }

    public void deletePackage(Long id) {
        SubscriptionPackage existing = getPackageById(id);
        repository.delete(existing);
    }
}
