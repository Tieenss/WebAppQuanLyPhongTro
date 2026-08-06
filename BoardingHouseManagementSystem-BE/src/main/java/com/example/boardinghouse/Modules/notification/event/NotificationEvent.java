package com.example.boardinghouse.Modules.notification.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class NotificationEvent extends ApplicationEvent {
    private final Long senderId;
    private final Long targetId; // Can be userId or buildingId
    private final String title;
    private final String content;
    private final TargetType targetType;

    public enum TargetType {
        USER, BUILDING
    }

    public NotificationEvent(Object source, Long senderId, Long targetId, TargetType targetType, String title, String content) {
        super(source);
        this.senderId = senderId;
        this.targetId = targetId;
        this.targetType = targetType;
        this.title = title;
        this.content = content;
    }
}
