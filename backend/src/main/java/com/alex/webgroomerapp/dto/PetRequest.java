package com.alex.webgroomerapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PetRequest(@NotNull Long customerId, @NotBlank String name, @NotBlank String breedText, Double weight, String notes) {
}
