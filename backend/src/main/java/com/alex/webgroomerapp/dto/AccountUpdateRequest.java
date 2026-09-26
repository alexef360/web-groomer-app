package com.alex.webgroomerapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AccountUpdateRequest(
        @NotBlank String login,
        @NotBlank String firstName,
        @NotBlank String lastName,
        String phoneNumber,
        @NotBlank @Email String email
) {
}
