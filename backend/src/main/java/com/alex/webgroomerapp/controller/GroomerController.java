package com.alex.webgroomerapp.controller;

import com.alex.webgroomerapp.dto.DayAvailabilityDto;
import com.alex.webgroomerapp.dto.GroomerResponse;
import com.alex.webgroomerapp.security.AuthSupport;
import com.alex.webgroomerapp.service.GroomerService;
import com.alex.webgroomerapp.service.VisitService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/groomers")
public class GroomerController {

    private final GroomerService groomerService;
    private final VisitService visitService;

    public GroomerController(GroomerService groomerService, VisitService visitService) {
        this.groomerService = groomerService;
        this.visitService = visitService;
    }

    @GetMapping
    public List<GroomerResponse> findAll() {
        return groomerService.findAllActive();
    }

    @GetMapping("/me")
    public GroomerResponse me() {
        return groomerService.findForUser(AuthSupport.currentUserId());
    }

    @GetMapping("/{id}/availability")
    public List<DayAvailabilityDto> availability(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return visitService.getGroomerAvailability(id, from, to);
    }
}
