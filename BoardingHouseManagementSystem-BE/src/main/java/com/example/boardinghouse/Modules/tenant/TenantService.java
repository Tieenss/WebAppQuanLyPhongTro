package com.example.boardinghouse.Modules.tenant;

import com.example.boardinghouse.Modules.tenant.dto.TenantRequest;
import com.example.boardinghouse.Modules.tenant.dto.TenantResponse;
import com.example.boardinghouse.Modules.user.tenant.TenantProfile;
import com.example.boardinghouse.Modules.user.tenant.TenantProfileRepository;
import com.example.boardinghouse.Modules.user.user.User;
import com.example.boardinghouse.Modules.user.user.UserRepository;
import com.example.boardinghouse.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final UserRepository userRepository;
    private final TenantProfileRepository tenantProfileRepository;

    @Transactional(readOnly = true)
    public List<TenantResponse> getTenants() {
        Long landlordId = SecurityUtils.getCurrentUserId();
        List<User> users = userRepository.findByLandlordIdAndRole(landlordId, "tenant");
        
        return users.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TenantResponse getTenantById(Long id) {
        Long landlordId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findByIdAndLandlordId(id, landlordId)
                .orElseThrow(() -> new RuntimeException("Tenant not found or access denied"));
        return mapToResponse(user);
    }

    @Transactional
    public TenantResponse createTenant(TenantRequest request) {
        Long landlordId = SecurityUtils.getCurrentUserId();

        User user = User.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .username(request.getPhone()) // Generate username from phone
                .password("123456") // Default password for tenant
                .email(request.getEmail())
                .avatarUrl(request.getAvatarUrl())
                .role("tenant")
                .landlord(userRepository.findById(landlordId).orElseThrow(() -> new RuntimeException("Landlord not found")))
                // In reality, might need username/password for tenants to login, but setting defaults or nulls for now
                .build();
        
        user = userRepository.save(user);

        TenantProfile profile = TenantProfile.builder()
                .user(user)
                .cccdNumber(request.getCccdNumber())
                .cccdFrontImg(request.getCccdFrontImg())
                .cccdBackImg(request.getCccdBackImg())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
                
        tenantProfileRepository.save(profile);

        return mapToResponse(user, profile);
    }

    @Transactional
    public TenantResponse updateTenant(Long id, TenantRequest request) {
        Long landlordId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findByIdAndLandlordId(id, landlordId)
                .orElseThrow(() -> new RuntimeException("Tenant not found or access denied"));
                
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setAvatarUrl(request.getAvatarUrl());
        userRepository.save(user);

        TenantProfile profile = tenantProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> TenantProfile.builder().user(user).build());

        profile.setCccdNumber(request.getCccdNumber());
        profile.setCccdFrontImg(request.getCccdFrontImg());
        profile.setCccdBackImg(request.getCccdBackImg());
        if (request.getIsActive() != null) {
            profile.setIsActive(request.getIsActive());
        }
        tenantProfileRepository.save(profile);

        return mapToResponse(user, profile);
    }

    @Transactional
    public void deleteTenant(Long id) {
        Long landlordId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findByIdAndLandlordId(id, landlordId)
                .orElseThrow(() -> new RuntimeException("Tenant not found or access denied"));
                
        tenantProfileRepository.deleteByUserId(user.getId());
        userRepository.delete(user);
    }

    private TenantResponse mapToResponse(User user) {
        TenantProfile profile = tenantProfileRepository.findByUserId(user.getId()).orElse(null);
        return mapToResponse(user, profile);
    }

    private TenantResponse mapToResponse(User user, TenantProfile profile) {
        return TenantResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .cccdNumber(profile != null ? profile.getCccdNumber() : null)
                .cccdFrontImg(profile != null ? profile.getCccdFrontImg() : null)
                .cccdBackImg(profile != null ? profile.getCccdBackImg() : null)
                .isActive(profile != null ? profile.getIsActive() : null)
                .build();
    }
}
