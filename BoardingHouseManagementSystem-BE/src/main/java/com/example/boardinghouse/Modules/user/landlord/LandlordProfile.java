package com.example.boardinghouse.Modules.user.landlord;

import com.example.boardinghouse.Modules.user.user.User;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entity đại diện cho bảng 'landlord_profiles'.
 * Chứa thông tin bổ sung dành riêng cho Chủ trọ.
 */
@Entity
@Table(name = "landlord_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandlordProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quan hệ 1-1 với User. 
    // Chủ trọ này thuộc về tài khoản User nào?
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "business_name", nullable = false, length = 200)
    private String businessName;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;

    @Column(name = "bank_account_number", nullable = false, length = 50)
    private String bankAccountNumber;

    @Column(name = "bank_account_holder", nullable = false, length = 150)
    private String bankAccountHolder;
}
