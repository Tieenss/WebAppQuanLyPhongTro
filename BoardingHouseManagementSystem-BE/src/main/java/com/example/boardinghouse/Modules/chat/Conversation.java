package com.example.boardinghouse.Modules.chat;

import com.example.boardinghouse.Modules.user.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho bảng 'conversations'.
 * Lưu trữ thông tin một phiên chat giữa Khách và Chủ trọ.
 */
@Entity
@Table(name = "conversations", uniqueConstraints = {
        // Đảm bảo giữa 1 khách và 1 chủ trọ chỉ có 1 cuộc hội thoại duy nhất
        @UniqueConstraint(columnNames = {"guest_id", "landlord_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Người nhắn tin (Khách vãng lai / Khách thuê)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    private User guest;

    // Chủ trọ tiếp nhận tin nhắn
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}
