package com.example.boardinghouse.Modules.notification.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String content;
    private String senderName;
    private LocalDateTime createdAt;
}
