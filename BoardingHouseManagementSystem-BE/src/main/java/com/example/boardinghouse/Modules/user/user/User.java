package com.example.boardinghouse.Modules.user.user;

import com.example.boardinghouse.Modules.user.landlord.LandlordProfile;
import com.example.boardinghouse.Modules.user.tenant.TenantProfile;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho bảng 'users' trong database.
 * Quản lý thông tin đăng nhập và phân quyền chung cho tất cả các loại người dùng.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên đăng nhập phải là duy nhất
    @Column(nullable = false, unique = true, length = 100)
    private String username;

    // Mật khẩu (Nên được mã hóa bằng BCrypt trước khi lưu)
    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(unique = true, length = 150)
    private String email;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    // Quyền của người dùng: 'landlord', 'staff', 'tenant', 'guest'
    // Đã chuyển sang dạng String cho dễ validate và mapping
    @Column(nullable = false, length = 20)
    private String role = "guest";

    // Khóa ngoại trỏ đến chính bảng users (self-referencing).
    // Nếu là khách thuê (tenant) do chủ trọ tạo, trường này sẽ chứa ID của chủ trọ đó.
    // Dùng FetchType.LAZY để tránh việc query đệ quy kéo theo cả đống user khác.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id")
    private User landlord;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
    
    // Đánh dấu để mapping 1-1 với LandlordProfile (nếu User này là chủ trọ)
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private LandlordProfile landlordProfile;

    // Đánh dấu để mapping 1-1 với TenantProfile (nếu User này là khách thuê)
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private TenantProfile tenantProfile;
}
