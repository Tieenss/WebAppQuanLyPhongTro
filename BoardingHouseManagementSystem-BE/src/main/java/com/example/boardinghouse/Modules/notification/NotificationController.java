package com.example.boardinghouse.Modules.notification;

import com.example.boardinghouse.Modules.notification.dto.NotificationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Lấy danh sách thông báo của 1 user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    // Endpoint test push thông báo (Thực tế nên bọc bằng DTO, mình để params cho nhanh)
    @PostMapping("/send-user")
    public ResponseEntity<NotificationResponse> sendToUser(
            @RequestParam Long senderId,
            @RequestParam Long receiverId,
            @RequestParam String title,
            @RequestParam String content) {
        return ResponseEntity.ok(notificationService.sendToUser(senderId, receiverId, title, content));
    }

    @PostMapping("/send-building")
    public ResponseEntity<NotificationResponse> sendToBuilding(
            @RequestParam Long senderId,
            @RequestParam Long buildingId,
            @RequestParam String title,
            @RequestParam String content) {
        return ResponseEntity.ok(notificationService.sendToBuilding(senderId, buildingId, title, content));
    }
}
