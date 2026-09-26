package com.alex.webgroomerapp.dto;

import com.alex.webgroomerapp.model.ServiceType;
import com.alex.webgroomerapp.model.TimeSlot;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record VisitRequest(@NotNull LocalDate date,
                           @NotNull TimeSlot timeSlot,
                           @NotNull Long groomerId,
                           @NotNull Long petId,
                           @NotNull ServiceType serviceType,
                           String ownerExpectations) {
}
