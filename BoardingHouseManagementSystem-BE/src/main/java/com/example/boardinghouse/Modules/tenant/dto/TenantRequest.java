package com.example.boardinghouse.Modules.tenant.dto;

import lombok.Data;
import jakarta.validation.constraints.Pattern;

@Data
public class TenantRequest {
    private String fullName;
    @Pattern(regexp = "^\\d{10}$", message = "Số điện thoại phải có đúng 10 chữ số")
    private String phone;
    private String email;
    private String avatarUrl;
    
    // Tenant Profile specific
    @Pattern(regexp = "^\\d{10,12}$", message = "CCCD/CMND phải có từ 10 đến 12 chữ số")
    private String cccdNumber;
    private String cccdFrontImg;
    private String cccdBackImg;
    private Boolean isActive;
}
