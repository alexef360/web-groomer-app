package com.alex.webgroomerapp.service;

import com.alex.webgroomerapp.dto.OwnerPetRequest;
import com.alex.webgroomerapp.dto.PetRequest;
import com.alex.webgroomerapp.dto.PetResponse;
import com.alex.webgroomerapp.exceptions.CustomerNotFoundException;
import com.alex.webgroomerapp.exceptions.PetNotFoundException;
import com.alex.webgroomerapp.exceptions.UserNotFoundException;
import com.alex.webgroomerapp.model.Customer;
import com.alex.webgroomerapp.model.Pet;
import com.alex.webgroomerapp.repo.ICustomerRepository;
import com.alex.webgroomerapp.repo.IPetRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PetService {

    private final IPetRepository petRepository;
    private final ICustomerRepository customerRepository;

    public PetService(IPetRepository petRepository, ICustomerRepository customerRepository) {
        this.petRepository = petRepository;
        this.customerRepository = customerRepository;
    }

    public List<PetResponse> findAll() {
        return petRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public List <PetResponse> findByCustomerId(Long customerId) {
        if(!customerRepository.existsById(customerId)) {
            throw new CustomerNotFoundException(customerId);
        }
        return petRepository.findByCustomerId(customerId).stream()
                .map(this::toResponse)
                .toList();
    }

    public PetResponse getById(Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new PetNotFoundException(id));
        return toResponse(pet);
    }

    @Transactional
    public PetResponse create(PetRequest request) {
       Customer customer = customerRepository.findById(request.customerId())
               .orElseThrow(() -> new CustomerNotFoundException(request.customerId()));

       Pet pet = new Pet ();
               pet.setCustomer(customer);
               pet.setName(request.name());
               pet.setBreedText(request.breedText());
               pet.setWeight(request.weight());
               pet.setNotes(request.notes());
               pet = petRepository.save(pet);
               return toResponse(pet);
    }

    @Transactional
    public PetResponse update(Long id, PetRequest request) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new PetNotFoundException(id));
        pet.setName(request.name());
        pet.setBreedText(request.breedText());
        pet.setWeight(request.weight());
        pet.setNotes(request.notes());
        pet = petRepository.save(pet);
        return toResponse(pet);
    }

    public List<PetResponse> findForUser(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return petRepository.findByCustomerId(customer.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PetResponse createForUser(Long userId, OwnerPetRequest request) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Pet pet = new Pet ();
        pet.setCustomer(customer);
        pet.setName(request.name());
        pet.setBreedText(request.breedText());
        pet.setWeight(request.weight());
        pet.setNotes(request.notes());
        pet = petRepository.save(pet);
        return toResponse(pet);
    }

    @Transactional
    public PetResponse updateForUser(Long userId, Long petId, OwnerPetRequest request) {
        Pet pet = requireOwnedPet(userId, petId);
        pet.setName(request.name());
        pet.setBreedText(request.breedText());
        pet.setWeight(request.weight());
        pet.setNotes(request.notes());
        pet = petRepository.save(pet);
        return toResponse(pet);
    }

    @Transactional
    public void deleteForUser(Long userId, Long petId) {
        Pet pet = requireOwnedPet(userId, petId);
        petRepository.delete(pet);
    }

    private Pet requireOwnedPet(Long userId, Long petId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new PetNotFoundException(petId));
        if (pet.getCustomer().getId() != customer.getId()) {
            throw new PetNotFoundException(petId);
        }
        return pet;
    }

    private PetResponse toResponse (Pet pet) {
        return new PetResponse(
                pet.getId(),
                pet.getCustomer().getId(),
                pet.getName(),
                pet.getBreedText(),
                pet.getWeight(),
                pet.getNotes()
        );
    }
}
