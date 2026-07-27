package com.example.boardinghouse.Modules.user.tenant;

import com.example.boardinghouse.Modules.user.user.User;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entity đại diện cho bảng 'tenant_profiles'.
 * Chứa thông tin bổ sung dành riêng cho Khách thuê.
 */
@Entity
@Table(name = "tenant_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quan hệ 1-1 với User.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "cccd_number", nullable = false, length = 20)
    private String cccdNumber;

    @Column(name = "cccd_front_img", length = 500)
    private String cccdFrontImg;

    @Column(name = "cccd_back_img", length = 500)
    private String cccdBackImg;

    // Trạng thái của khách thuê (active, inactive)
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
