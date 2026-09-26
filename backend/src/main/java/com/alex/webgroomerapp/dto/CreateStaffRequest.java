package com.alex.webgroomerapp.dto;

import com.alex.webgroomerapp.model.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateStaffRequest(@NotBlank String login, @NotBlank @Size(min = 8, message = "At least 8 characters") String password, @NotNull UserRole role, String displayName) {
}
