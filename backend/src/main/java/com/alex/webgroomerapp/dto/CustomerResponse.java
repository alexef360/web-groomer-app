package com.alex.webgroomerapp.dto;

public record CustomerResponse(Long id, String firstName, String lastName, String phoneNumber, String email, Long userId) {
}
