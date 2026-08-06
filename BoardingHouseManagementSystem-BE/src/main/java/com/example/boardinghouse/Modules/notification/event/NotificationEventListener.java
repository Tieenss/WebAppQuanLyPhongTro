package com.example.boardinghouse.Modules.notification.event;

import com.example.boardinghouse.Modules.notification.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventListener {

    private final NotificationService notificationService;

    public NotificationEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        if (event.getTargetType() == NotificationEvent.TargetType.USER) {
            notificationService.sendToUser(event.getSenderId(), event.getTargetId(), event.getTitle(), event.getContent());
        } else if (event.getTargetType() == NotificationEvent.TargetType.BUILDING) {
            notificationService.sendToBuilding(event.getSenderId(), event.getTargetId(), event.getTitle(), event.getContent());
        }
    }
}
