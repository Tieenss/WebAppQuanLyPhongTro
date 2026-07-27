package com.example.boardinghouse.Modules.chat;

import com.example.boardinghouse.Modules.user.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho bảng 'messages'.
 * Chứa nội dung từng dòng tin nhắn.
 */
@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tin nhắn này thuộc cuộc hội thoại nào?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    // Ai là người gửi? (Có thể là guest hoặc landlord)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "message_text", columnDefinition = "TEXT")
    private String messageText;

    // Gửi kèm ảnh (nếu có)
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    // Trạng thái đã xem hay chưa (Dùng cho thông báo chưa đọc)
    @Column(name = "is_read")
    private Boolean isRead = false;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}
