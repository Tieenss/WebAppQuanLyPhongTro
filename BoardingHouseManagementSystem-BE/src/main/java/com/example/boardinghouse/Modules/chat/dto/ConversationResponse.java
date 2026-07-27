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
    private Long guestId;
    private String guestName;
    private Long landlordId;
    private String landlordName;
    private String lastMessage; // Tin nhắn cuối cùng
    private Long unreadCount;   // Số tin nhắn chưa đọc
}
