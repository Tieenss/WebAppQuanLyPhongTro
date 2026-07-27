package com.example.boardinghouse.Modules.chat.dto;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private Long conversationId;
    private Long senderId;
    private String messageText;
    private String imageUrl;
}
