package com.example.boardinghouse.Modules.chat;

import com.example.boardinghouse.Modules.user.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho bảng 'conversation_participants'.
 * Lưu trữ mối quan hệ Nhiều - Nhiều giữa User và Conversation.
 */
@Entity
@Table(name = "conversation_participants", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"conversation_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "role", length = 50)
    @Builder.Default
    private String role = "MEMBER"; // "ADMIN" hoặc "MEMBER"

    @Column(name = "unread_count")
    @Builder.Default
    private Integer unreadCount = 0;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "joined_at", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime joinedAt;
}
