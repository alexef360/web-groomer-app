package com.alex.webgroomerapp.service;

import com.alex.webgroomerapp.exceptions.InvalidDataException;
import com.alex.webgroomerapp.model.*;
import com.alex.webgroomerapp.repo.IGroomerProfileRepository;
import com.alex.webgroomerapp.repo.IPetRepository;
import com.alex.webgroomerapp.repo.IVisitRepository;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VisitServiceUpdateStatusTest {

    @Mock
    IVisitRepository visitRepository;
    @Mock
    IPetRepository petRepository;
    @Mock
    IGroomerProfileRepository groomerProfileRepository;

    @InjectMocks
    VisitService visitService;

    @AfterEach
    void clearSecurity() {
        SecurityContextHolder.clearContext();
    }

    private void loginAs(Long userId, String role) {
        var auth = new UsernamePasswordAuthenticationToken(
                userId, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private Visit visitOwnedBy(Long groomerUserId) {
        User groomerUser = new User();
        groomerUser.setId(groomerUserId);

        GroomerProfile profile = new GroomerProfile();
        profile.setId(10L);
        profile.setUser(groomerUser);

        Customer customer = new Customer();
        customer.setId(1L);
        customer.setFirstName("Anna");
        customer.setLastName("K");

        Pet pet = new Pet();
        pet.setId(1L);
        pet.setName("Milo");
        pet.setCustomer(customer);

        Visit visit = new Visit();
        visit.setId(100L);
        visit.setGroomer(profile);
        visit.setPet(pet);
        visit.setStatus(VisitStatus.PLANNED);
        visit.setServiceType(ServiceType.BATH);
        visit.setTimeSlot(TimeSlot.SLOT_10_00);

        return visit;
    }

    @Test
    void groomerCannotUpdateSomeoneElsesVisit() {
        loginAs(2L, "GROOMER");
        Visit visit = visitOwnedBy(1L);
        when(visitRepository.findById(100L)).thenReturn(Optional.of(visit));
        assertThrows(InvalidDataException.class,
                () -> visitService.updateStatus(100L, VisitStatus.IN_PROGRESS));
        verify(visitRepository, never()).save(any());
    }
    @Test
    void receptionCanUpdateAnyVisit() {
        loginAs(99L, "RECEPTION");
        Visit visit = visitOwnedBy(1L);
        when(visitRepository.findById(100L)).thenReturn(Optional.of(visit));
        when(visitRepository.save(any(Visit.class))).thenAnswer(inv -> inv.getArgument(0));
        assertDoesNotThrow(() -> visitService.updateStatus(100L, VisitStatus.IN_PROGRESS));
        verify(visitRepository).save(visit);
    }
}






