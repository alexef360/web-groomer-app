package com.alex.webgroomerapp.controller;

import com.alex.webgroomerapp.dto.DayAvailabilityDto;
import com.alex.webgroomerapp.dto.VisitRequest;
import com.alex.webgroomerapp.dto.VisitResponse;
import com.alex.webgroomerapp.security.AuthSupport;
import com.alex.webgroomerapp.service.VisitService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/me/visits")
public class OwnerVisitController {

    private final VisitService visitService;

    public OwnerVisitController(VisitService visitService) {
        this.visitService = visitService;
    }

    @GetMapping
    public List<VisitResponse> findForUser() {
        return visitService.findForUser(AuthSupport.currentUserId());
    }

    @GetMapping("/availability")
    public List<DayAvailabilityDto> availability(
            @RequestParam Long groomerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        AuthSupport.currentUserId();
        return visitService.getGroomerAvailability(groomerId, from, to);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VisitResponse bookForUser(@Valid @RequestBody VisitRequest request) {
        return visitService.bookForUser(AuthSupport.currentUserId(), request);
    }

    @PostMapping("/{id}/cancel")
    public VisitResponse cancelForUser(@PathVariable Long id) {
        return visitService.cancelForUser(AuthSupport.currentUserId(), id);
    }
}
