package com.example.boardinghouse.Modules.tenant.dto;

import lombok.Data;

@Data
public class TenantRequest {
    private String fullName;
    private String phone;
    private String email;
    private String avatarUrl;
    
    // Tenant Profile specific
    private String cccdNumber;
    private String cccdFrontImg;
    private String cccdBackImg;
    private Boolean isActive;
}
