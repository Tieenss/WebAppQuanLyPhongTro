package com.example.boardinghouse.Modules.notification;

import com.example.boardinghouse.Modules.building.Building;
import com.example.boardinghouse.Modules.user.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho bảng 'notifications'.
 * Dùng để phát thông báo hệ thống hoặc thông báo từ Chủ trọ.
 */
@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Người gửi (Thường là Landlord hoặc Hệ thống/Admin)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    // Người nhận (Nếu là cá nhân) - Có thể NULL
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id")
    private User receiver;

    // Tòa nhà nhận (Nếu thông báo toàn tòa nhà) - Có thể NULL
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;

    @Column(nullable = false, length = 250)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}
