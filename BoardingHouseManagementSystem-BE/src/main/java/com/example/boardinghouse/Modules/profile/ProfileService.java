package com.example.boardinghouse.Modules.profile;

import com.example.boardinghouse.Modules.profile.dto.ChangePasswordRequest;
import com.example.boardinghouse.Modules.profile.dto.ProfileResponse;
import com.example.boardinghouse.Modules.profile.dto.UpdateProfileRequest;
import com.example.boardinghouse.Modules.user.landlord.LandlordProfile;
import com.example.boardinghouse.Modules.user.landlord.LandlordProfileRepository;
import com.example.boardinghouse.Modules.user.tenant.TenantProfile;
import com.example.boardinghouse.Modules.user.tenant.TenantProfileRepository;
import com.example.boardinghouse.Modules.user.user.User;
import com.example.boardinghouse.Modules.user.user.UserRepository;
import com.example.boardinghouse.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final LandlordProfileRepository landlordProfileRepository;
    private final TenantProfileRepository tenantProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileResponse getCurrentUserProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("Unauthorized");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProfileResponse.ProfileResponseBuilder builder = ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl());

        if ("LANDLORD".equalsIgnoreCase(user.getRole())) {
            landlordProfileRepository.findByUserId(userId).ifPresent(lp -> {
                builder.businessName(lp.getBusinessName());
                builder.taxCode(lp.getTaxCode());
                builder.bankName(lp.getBankName());
                builder.bankAccountNumber(lp.getBankAccountNumber());
                builder.bankAccountHolder(lp.getBankAccountHolder());
                builder.cccdNumber(lp.getCccdNumber());
                builder.cccdPlace(lp.getCccdPlace());
            });
        } else if ("TENANT".equalsIgnoreCase(user.getRole())) {
            tenantProfileRepository.findByUserId(userId).ifPresent(tp -> {
                builder.cccdNumber(tp.getCccdNumber());
                builder.cccdPlace(tp.getCccdPlace());
                builder.cccdFrontImg(tp.getCccdFrontImg());
                builder.cccdBackImg(tp.getCccdBackImg());
                builder.isActive(tp.getIsActive());
            });
        }

        return builder.build();
    }

    @Transactional
    public ProfileResponse updateProfile(UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("Unauthorized");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update common fields
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        final User savedUser = userRepository.save(user);

        if ("LANDLORD".equalsIgnoreCase(savedUser.getRole())) {
            LandlordProfile lp = landlordProfileRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        LandlordProfile newLp = new LandlordProfile();
                        newLp.setUser(savedUser);
                        return newLp;
                    });
            
            if (request.getBusinessName() != null) lp.setBusinessName(request.getBusinessName());
            if (request.getTaxCode() != null) lp.setTaxCode(request.getTaxCode());
            if (request.getBankName() != null) lp.setBankName(request.getBankName());
            if (request.getBankAccountNumber() != null) lp.setBankAccountNumber(request.getBankAccountNumber());
            if (request.getBankAccountHolder() != null) lp.setBankAccountHolder(request.getBankAccountHolder());
            if (request.getCccdNumber() != null) lp.setCccdNumber(request.getCccdNumber());
            if (request.getCccdPlace() != null) lp.setCccdPlace(request.getCccdPlace());
            
            // Set defaults for non-nullable fields if they are still null (for new profiles)
            if (lp.getBusinessName() == null) lp.setBusinessName(savedUser.getFullName() != null ? savedUser.getFullName() : "");
            if (lp.getBankName() == null) lp.setBankName("");
            if (lp.getBankAccountNumber() == null) lp.setBankAccountNumber("");
            if (lp.getBankAccountHolder() == null) lp.setBankAccountHolder(savedUser.getFullName() != null ? savedUser.getFullName() : "");

            landlordProfileRepository.save(lp);

        } else if ("TENANT".equalsIgnoreCase(savedUser.getRole())) {
            TenantProfile tp = tenantProfileRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        TenantProfile newTp = new TenantProfile();
                        newTp.setUser(savedUser);
                        newTp.setIsActive(true);
                        return newTp;
                    });
            
            if (request.getCccdNumber() != null) tp.setCccdNumber(request.getCccdNumber());
            if (request.getCccdPlace() != null) tp.setCccdPlace(request.getCccdPlace());
            if (request.getCccdFrontImg() != null) tp.setCccdFrontImg(request.getCccdFrontImg());
            if (request.getCccdBackImg() != null) tp.setCccdBackImg(request.getCccdBackImg());
            
            // Set default for non-nullable fields if they are still null
            if (tp.getCccdNumber() == null) tp.setCccdNumber("");

            tenantProfileRepository.save(tp);
        }

        return getCurrentUserProfile();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("Unauthorized");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean passwordMatch = false;
        if (user.getPassword() != null && user.getPassword().startsWith("$2a$")) {
            passwordMatch = passwordEncoder.matches(request.getOldPassword(), user.getPassword());
        } else {
            // Legacy plain text check
            passwordMatch = request.getOldPassword().equals(user.getPassword());
        }

        if (!passwordMatch) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
