package com.example.boardinghouse.Modules.chat.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Trả về thông tin ngắn gọn của cuộc hội thoại để hiển thị trên danh sách.
 */
@Data
@Builder
public class ConversationResponse {
    private Long id;
    private String chatName; // Tên nhóm hoặc tên người kia (nếu là 1-1)
    private Boolean isGroupChat;
    private String chatImage; // Avatar nhóm hoặc người kia
    private String lastMessage; // Tin nhắn cuối cùng
    private Long unreadCount;   // Số tin nhắn chưa đọc
}
