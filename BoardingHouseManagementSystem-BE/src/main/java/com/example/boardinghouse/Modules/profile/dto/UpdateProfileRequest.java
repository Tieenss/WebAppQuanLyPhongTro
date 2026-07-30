package com.example.boardinghouse.Modules.profile.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    // Common fields
    private String fullName;
    private String phone;
    private String email;
    private String avatarUrl;

    // Landlord specific fields
    private String businessName;
    private String taxCode;
    private String bankName;
    private String bankAccountNumber;
    private String bankAccountHolder;

    // Tenant specific fields
    private String cccdNumber;
    private String cccdFrontImg;
    private String cccdBackImg;
}
