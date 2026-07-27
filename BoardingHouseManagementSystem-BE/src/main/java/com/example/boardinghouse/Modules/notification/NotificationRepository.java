package com.example.boardinghouse.Modules.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Lấy thông báo cá nhân
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    // Lấy thông báo chung của tòa nhà
    List<Notification> findByBuildingIdOrderByCreatedAtDesc(Long buildingId);
}
