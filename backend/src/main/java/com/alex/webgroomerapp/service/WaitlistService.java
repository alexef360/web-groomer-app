package com.alex.webgroomerapp.service;

import com.alex.webgroomerapp.dto.WaitlistEntryRequest;
import com.alex.webgroomerapp.dto.WaitlistEntryResponse;
import com.alex.webgroomerapp.exceptions.CustomerNotFoundException;
import com.alex.webgroomerapp.exceptions.InvalidDataException;
import com.alex.webgroomerapp.exceptions.PetNotFoundException;
import com.alex.webgroomerapp.model.*;
import com.alex.webgroomerapp.repo.ICustomerRepository;
import com.alex.webgroomerapp.repo.IGroomerProfileRepository;
import com.alex.webgroomerapp.repo.IPetRepository;
import com.alex.webgroomerapp.repo.IWaitlistRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class WaitlistService {

    private final IWaitlistRepository waitlistRepository;
    private final ICustomerRepository customerRepository;
    private final IPetRepository petRepository;
    private final IGroomerProfileRepository groomerProfileRepository;

    public WaitlistService(
            IWaitlistRepository waitlistRepository,
            ICustomerRepository customerRepository,
            IPetRepository petRepository,
            IGroomerProfileRepository groomerProfileRepository
    ) {
        this.waitlistRepository = waitlistRepository;
        this.customerRepository = customerRepository;
        this.petRepository = petRepository;
        this.groomerProfileRepository = groomerProfileRepository;
    }

    public List<WaitlistEntryResponse> findAll() {
        return waitlistRepository.findAllByOrderByPriorityDescCreatedAtAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<WaitlistEntryResponse> suggestions() {
        return waitlistRepository.findByStatusOrderByPriorityDescCreatedAtAsc(WaitlistStatus.WAITING).stream()
                .map(this::toResponse)
                .limit(10)
                .toList();
    }

    @Transactional
    public WaitlistEntryResponse create(WaitlistEntryRequest request) {
        if (request.customerId() == null) {
            throw new InvalidDataException("customerId is required");
        }
        WaitlistEntry entry = new WaitlistEntry();
        apply(entry, request, true);
        entry.setCreatedAt(Instant.now());
        if (entry.getStatus() == null) {
            entry.setStatus(WaitlistStatus.WAITING);
        }
        return toResponse(waitlistRepository.save(entry));
    }

    @Transactional
    public WaitlistEntryResponse update(Long id, WaitlistEntryRequest request) {
        WaitlistEntry entry = waitlistRepository.findById(id)
                .orElseThrow(() -> new InvalidDataException("Waitlist entry not found"));
        apply(entry, request, false);
        return toResponse(waitlistRepository.save(entry));
    }

    @Transactional
    public void delete(Long id) {
        WaitlistEntry entry = waitlistRepository.findById(id)
                .orElseThrow(() -> new InvalidDataException("Waitlist entry not found"));
        entry.setStatus(WaitlistStatus.CANCELLED);
        waitlistRepository.save(entry);
    }

    private void apply(WaitlistEntry entry, WaitlistEntryRequest request, boolean creating) {
        if (creating || request.customerId() != null) {
            Customer customer = customerRepository.findById(request.customerId())
                    .orElseThrow(() -> new CustomerNotFoundException(request.customerId()));
            entry.setCustomer(customer);
        }
        if (request.petId() != null) {
            Pet pet = petRepository.findById(request.petId())
                    .orElseThrow(() -> new PetNotFoundException(request.petId()));
            entry.setPet(pet);
        } else if (creating) {
            entry.setPet(null);
        }
        if (request.preferredGroomerId() != null) {
            GroomerProfile groomer = groomerProfileRepository.findById(request.preferredGroomerId())
                    .orElseThrow(() -> new InvalidDataException("Groomer not found"));
            entry.setPreferredGroomer(groomer);
        } else if (creating) {
            entry.setPreferredGroomer(null);
        }
        if (request.preferredService() != null || creating) {
            entry.setPreferredService(request.preferredService());
        }
        if (request.notes() != null || creating) {
            entry.setNotes(request.notes());
        }
        if (request.priority() != null) {
            entry.setPriority(request.priority());
        }
        if (request.status() != null) {
            entry.setStatus(request.status());
        }
    }

    private WaitlistEntryResponse toResponse(WaitlistEntry entry) {
        Customer c = entry.getCustomer();
        String name = (c.getFirstName() + " " + c.getLastName()).trim();
        Pet pet = entry.getPet();
        GroomerProfile groomer = entry.getPreferredGroomer();
        return new WaitlistEntryResponse(
                entry.getId(),
                c.getId(),
                name,
                c.getPhoneNumber(),
                pet != null ? pet.getId() : null,
                pet != null ? pet.getName() : null,
                groomer != null ? groomer.getId() : null,
                groomer != null ? groomer.getDisplayName() : null,
                entry.getPreferredService(),
                entry.getNotes(),
                entry.getPriority(),
                entry.getStatus(),
                entry.getCreatedAt()
        );
    }
}
