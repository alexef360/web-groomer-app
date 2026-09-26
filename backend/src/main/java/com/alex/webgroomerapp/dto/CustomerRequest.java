package com.alex.webgroomerapp.dto;

import jakarta.validation.constraints.NotBlank;

public record CustomerRequest(@NotBlank String firstName, @NotBlank String lastName, String phoneNumber, String email) {
}
