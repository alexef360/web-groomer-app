package com.alex.webgroomerapp.security;

import org.springframework.security.core.context.SecurityContextHolder;

public class AuthSupport {

    private AuthSupport() {}

    public static Long currentUserId() {
        Object principal = SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return (Long) principal;
    }

    public static boolean hasRole(String role) {
     var auth = SecurityContextHolder.getContext().getAuthentication();
     if (auth == null) return false;
     return auth.getAuthorities().stream()
             .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}
