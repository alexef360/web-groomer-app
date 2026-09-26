package com.alex.webgroomerapp.dto;

import com.alex.webgroomerapp.model.UserRole;

public record AuthResponse(Long id, String login, UserRole role, String displayName, String token) {

}
