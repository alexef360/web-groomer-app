package com.alex.webgroomerapp.dto;

import com.alex.webgroomerapp.model.VisitStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateVisitStatusRequest(@NotNull VisitStatus status) {
}
