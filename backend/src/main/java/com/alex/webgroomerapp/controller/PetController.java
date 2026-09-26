package com.alex.webgroomerapp.controller;

import com.alex.webgroomerapp.dto.PetRequest;
import com.alex.webgroomerapp.dto.PetResponse;
import com.alex.webgroomerapp.service.PetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @GetMapping
    public List<PetResponse> findAll() {
        return petService.findAll();
    }
    @GetMapping("/{id}")
    public PetResponse getById(@PathVariable Long id) {
        return petService.getById(id);
    }

    @GetMapping(params = "customerId")
    public List<PetResponse> findByCustomerId(@RequestParam Long customerId) {
        return petService.findByCustomerId(customerId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PetResponse create(@Valid @RequestBody PetRequest request) {
        return petService.create(request);
    }

    @PutMapping("/{id}")
    public PetResponse update(@PathVariable Long id, @Valid @RequestBody PetRequest request) {
        return petService.update(id, request);
    }

}
