package com.alex.webgroomerapp.dto;

import com.alex.webgroomerapp.model.TimeSlot;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record RescheduleVisitRequest(
        @NotNull LocalDate date,
        @NotNull TimeSlot timeSlot,
        @NotNull Long groomerId
) {
}
