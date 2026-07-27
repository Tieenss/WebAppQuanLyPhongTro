package com.example.boardinghouse.Modules.notification;

import com.example.boardinghouse.Modules.building.Building;
import com.example.boardinghouse.Modules.building.BuildingRepository;
import com.example.boardinghouse.Modules.notification.dto.NotificationResponse;
import com.example.boardinghouse.Modules.user.user.User;
import com.example.boardinghouse.Modules.user.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final BuildingRepository buildingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               BuildingRepository buildingRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.buildingRepository = buildingRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Gửi thông báo đến 1 cá nhân cụ thể
     */
    public NotificationResponse sendToUser(Long senderId, Long receiverId, String title, String content) {
        User sender = userRepository.findById(senderId).orElseThrow();
        User receiver = userRepository.findById(receiverId).orElseThrow();

        Notification noti = Notification.builder()
                .sender(sender)
                .receiver(receiver)
                .title(title)
                .content(content)
                .build();
        Notification saved = notificationRepository.save(noti);

        NotificationResponse response = mapToResponse(saved);
        // Bắn thông báo real-time qua WebSocket tới kênh riêng của User
        messagingTemplate.convertAndSend("/topic/user/" + receiverId + "/notifications", response);
        return response;
    }

    /**
     * Gửi thông báo broadcast tới toàn tòa nhà
     */
    public NotificationResponse sendToBuilding(Long senderId, Long buildingId, String title, String content) {
        User sender = userRepository.findById(senderId).orElseThrow();
        Building building = buildingRepository.findById(buildingId).orElseThrow();

        Notification noti = Notification.builder()
                .sender(sender)
                .building(building)
                .title(title)
                .content(content)
                .build();
        Notification saved = notificationRepository.save(noti);

        NotificationResponse response = mapToResponse(saved);
        // Bắn broadcast qua WebSocket
        messagingTemplate.convertAndSend("/topic/building/" + buildingId + "/notifications", response);
        return response;
    }

    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private NotificationResponse mapToResponse(Notification noti) {
        return NotificationResponse.builder()
                .id(noti.getId())
                .title(noti.getTitle())
                .content(noti.getContent())
                .senderName(noti.getSender().getFullName())
                .createdAt(noti.getCreatedAt())
                .build();
    }
}
