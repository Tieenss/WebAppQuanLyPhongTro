package com.example.boardinghouse.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof String) {
            try {
                return Long.parseLong((String) authentication.getPrincipal());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
