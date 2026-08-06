package com.example.boardinghouse.Modules.profile.dto;

import lombok.Data;
import jakarta.validation.constraints.Pattern;

@Data
public class UpdateProfileRequest {
    // Common fields
    private String fullName;
    @Pattern(regexp = "^\\d{10}$", message = "Số điện thoại phải có đúng 10 chữ số")
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
    @Pattern(regexp = "^\\d{10,12}$", message = "CCCD/CMND phải có từ 10 đến 12 chữ số")
    private String cccdNumber;
    private String cccdFrontImg;
    private String cccdBackImg;
}
