package com.example.boardinghouse.Modules.chat;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho bảng 'conversations'.
 * Lưu trữ thông tin một phiên chat (1-1 hoặc nhóm).
 */
@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên của nhóm chat (chỉ dùng nếu là group chat)
    @Column(name = "chat_name", length = 255)
    private String chatName;

    // Phân biệt chat 1-1 và chat nhóm
    @Column(name = "is_group_chat")
    private Boolean isGroupChat = false;

    // Ảnh đại diện của nhóm (nếu có)
    @Column(name = "chat_image", length = 500)
    private String chatImage;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}
