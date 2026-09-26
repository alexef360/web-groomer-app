package com.alex.webgroomerapp.dto;

import com.alex.webgroomerapp.model.ServiceType;
import com.alex.webgroomerapp.model.TimeSlot;
import com.alex.webgroomerapp.model.VisitStatus;

import java.time.LocalDate;

public record VisitResponse(
        Long id,
        LocalDate date,
        TimeSlot timeSlot,
        Long groomerId,
        String groomerName,
        Long petId,
        String petName,
        String petBreed,
        String petNotes,
        Long customerId,
        String customerName,
        String customerPhone,
        ServiceType serviceType,
        VisitStatus status,
        String ownerExpectations,
        String groomerNotes
) {
}
