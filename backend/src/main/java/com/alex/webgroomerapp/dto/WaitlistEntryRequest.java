package com.alex.webgroomerapp.dto;

import com.alex.webgroomerapp.model.ServiceType;
import com.alex.webgroomerapp.model.WaitlistStatus;

public record WaitlistEntryRequest(
        Long customerId,
        Long petId,
        Long preferredGroomerId,
        ServiceType preferredService,
        String notes,
        Integer priority,
        WaitlistStatus status
) {
}
