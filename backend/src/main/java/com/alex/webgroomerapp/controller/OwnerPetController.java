package com.alex.webgroomerapp.controller;

import com.alex.webgroomerapp.dto.OwnerPetRequest;
import com.alex.webgroomerapp.dto.PetResponse;
import com.alex.webgroomerapp.security.AuthSupport;
import com.alex.webgroomerapp.service.PetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me/pets")
public class OwnerPetController {

    private final PetService petService;

    public OwnerPetController(PetService petService) {
        this.petService = petService;
    }

    @GetMapping
    public List<PetResponse> findForUser() {
        return petService.findForUser(AuthSupport.currentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PetResponse createForUser(
            @Valid @RequestBody OwnerPetRequest request
    ) {
        return petService.createForUser(AuthSupport.currentUserId(), request);
    }

    @PutMapping("/{id}")
    public PetResponse updateForUser(
            @PathVariable Long id,
            @Valid @RequestBody OwnerPetRequest request
    ) {
        return petService.updateForUser(AuthSupport.currentUserId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteForUser(@PathVariable Long id) {
        petService.deleteForUser(AuthSupport.currentUserId(), id);
    }
}