package com.alex.webgroomerapp.dto;

import com.alex.webgroomerapp.model.ServiceType;
import com.alex.webgroomerapp.model.WaitlistStatus;

import java.time.Instant;

public record WaitlistEntryResponse(
        Long id,
        Long customerId,
        String customerName,
        String customerPhone,
        Long petId,
        String petName,
        Long preferredGroomerId,
        String preferredGroomerName,
        ServiceType preferredService,
        String notes,
        int priority,
        WaitlistStatus status,
        Instant createdAt
) {
}
