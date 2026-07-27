package com.example.boardinghouse.Modules.tenant.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TenantResponse {
    private Long id; // userId
    private String fullName;
    private String phone;
    private String email;
    private String avatarUrl;
    private LocalDateTime createdAt;
    
    // Tenant Profile specific
    private String cccdNumber;
    private String cccdFrontImg;
    private String cccdBackImg;
    private Boolean isActive;
}
