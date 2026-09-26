package com.alex.webgroomerapp.dto;

public record AccountResponse(
        Long userId,
        String login,
        String role,
        String firstName,
        String lastName,
        String phoneNumber,
        String email
) {
}
