package com.alex.webgroomerapp.dto;

import jakarta.validation.constraints.NotBlank;

public record OwnerPetRequest(@NotBlank String name, @NotBlank String breedText, Double weight, String notes) {
}
