package com.alex.webgroomerapp.service;

import com.alex.webgroomerapp.dto.GroomerResponse;
import com.alex.webgroomerapp.exceptions.InvalidDataException;
import com.alex.webgroomerapp.model.GroomerProfile;
import com.alex.webgroomerapp.repo.IGroomerProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroomerService {

    private final IGroomerProfileRepository groomerRepository;

    public GroomerService(IGroomerProfileRepository groomerRepository) {
        this.groomerRepository = groomerRepository;
    }

    public List<GroomerResponse> findAllActive() {
        return groomerRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    public GroomerResponse findForUser(Long userId) {
        return groomerRepository.findByUserId(userId)
                .map(this::toResponse)
                .orElseThrow(() -> new InvalidDataException("Groomer profile not found"));
    }

    private GroomerResponse toResponse(GroomerProfile groomer) {
        return new GroomerResponse(
                groomer.getId(),
                groomer.getDisplayName()
        );
    }
}
