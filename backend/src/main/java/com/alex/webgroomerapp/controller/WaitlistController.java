package com.alex.webgroomerapp.controller;

import com.alex.webgroomerapp.dto.WaitlistEntryRequest;
import com.alex.webgroomerapp.dto.WaitlistEntryResponse;
import com.alex.webgroomerapp.service.WaitlistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    private final WaitlistService waitlistService;

    public WaitlistController(WaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    @GetMapping
    public List<WaitlistEntryResponse> findAll() {
        return waitlistService.findAll();
    }

    @GetMapping("/suggestions")
    public List<WaitlistEntryResponse> suggestions() {
        return waitlistService.suggestions();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WaitlistEntryResponse create(@Valid @RequestBody WaitlistEntryRequest request) {
        return waitlistService.create(request);
    }

    @PatchMapping("/{id}")
    public WaitlistEntryResponse update(@PathVariable Long id, @Valid @RequestBody WaitlistEntryRequest request) {
        return waitlistService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        waitlistService.delete(id);
    }
}
