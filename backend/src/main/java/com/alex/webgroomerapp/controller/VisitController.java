package com.alex.webgroomerapp.controller;

import com.alex.webgroomerapp.dto.RescheduleVisitRequest;
import com.alex.webgroomerapp.dto.UpdateVisitStatusRequest;
import com.alex.webgroomerapp.dto.VisitRequest;
import com.alex.webgroomerapp.dto.VisitResponse;
import com.alex.webgroomerapp.exceptions.InvalidDataException;
import com.alex.webgroomerapp.service.VisitService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/visits")
public class VisitController {

    private final VisitService visitService;

    public VisitController(VisitService visitService) {
        this.visitService = visitService;
    }

    @GetMapping
    public List<VisitResponse> find(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        if (from != null && to != null) {
            return visitService.findByDateRange(from, to);
        }
        if (date != null) {
            return visitService.findByDate(date);
        }
        throw new InvalidDataException("Provide date or from/to");
    }

    @GetMapping("/{id}")
    public VisitResponse getById(@PathVariable Long id) {
        return visitService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VisitResponse book(@Valid @RequestBody VisitRequest request) {
        return visitService.book(request);
    }

    @PatchMapping("/{id}/status")
    public VisitResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateVisitStatusRequest request) {
        return visitService.updateStatus(id, request.status());
    }

    @PatchMapping("/{id}/reschedule")
    public VisitResponse reschedule(@PathVariable Long id, @Valid @RequestBody RescheduleVisitRequest request) {
        return visitService.reschedule(id, request.date(), request.timeSlot(), request.groomerId());
    }
}
