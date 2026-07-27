package com.example.boardinghouse.Modules.chat.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ChatMessageResponse {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String messageText;
    private String imageUrl;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
