package com.example.boardinghouse.Modules.profile.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String avatarUrl;

    // Landlord specific fields
    private String businessName;
    private String taxCode;
    private String bankName;
    private String bankAccountNumber;
    private String bankAccountHolder;

    // Tenant specific fields
    private String cccdNumber;
    private String cccdPlace;
    private String cccdFrontImg;
    private String cccdBackImg;
    private Boolean isActive;
}
