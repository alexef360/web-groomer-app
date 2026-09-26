package com.alex.webgroomerapp.dto;

public record PetResponse(Long id, Long customerId, String name, String breedText, Double weight, String notes) {
}
