package com.alex.webgroomerapp.dto;

import java.time.LocalDate;
import java.util.List;

public record DayAvailabilityDto(
        LocalDate date,
        boolean open,
        int availableCount,
        List<SlotAvailabilityDto> slots
) {
}
