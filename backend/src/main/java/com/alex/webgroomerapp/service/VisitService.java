package com.alex.webgroomerapp.service;

import com.alex.webgroomerapp.dto.DayAvailabilityDto;
import com.alex.webgroomerapp.dto.SlotAvailabilityDto;
import com.alex.webgroomerapp.dto.VisitRequest;
import com.alex.webgroomerapp.dto.VisitResponse;
import com.alex.webgroomerapp.exceptions.InvalidDataException;
import com.alex.webgroomerapp.exceptions.PetNotFoundException;
import com.alex.webgroomerapp.exceptions.SlotConflictException;
import com.alex.webgroomerapp.exceptions.VisitNotFoundException;
import com.alex.webgroomerapp.model.GroomerProfile;
import com.alex.webgroomerapp.model.Pet;
import com.alex.webgroomerapp.model.TimeSlot;
import com.alex.webgroomerapp.model.Visit;
import com.alex.webgroomerapp.model.VisitStatus;
import com.alex.webgroomerapp.repo.IGroomerProfileRepository;
import com.alex.webgroomerapp.repo.IPetRepository;
import com.alex.webgroomerapp.repo.IVisitRepository;
import com.alex.webgroomerapp.security.AuthSupport;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class VisitService {

    private final IVisitRepository visitRepository;
    private final IPetRepository petRepository;
    private final IGroomerProfileRepository groomerProfileRepository;

    public VisitService(IVisitRepository visitRepository, IPetRepository petRepository,
                        IGroomerProfileRepository groomerProfileRepository) {
        this.visitRepository = visitRepository;
        this.petRepository = petRepository;
        this.groomerProfileRepository = groomerProfileRepository;
    }

    public List<VisitResponse> findByDate(LocalDate date) {
        if(AuthSupport.hasRole("RECEPTION") || AuthSupport.hasRole("ADMIN")) {
            return visitRepository.findByDate(date).stream()
                    .map(this::toResponse)
                    .toList();
        }

        if(AuthSupport.hasRole("GROOMER")){
           GroomerProfile groomer = groomerProfileRepository.findByUserId(AuthSupport.currentUserId())
                   .orElseThrow(() -> new InvalidDataException("Groomer not found"));

           return visitRepository.findByDateAndGroomer_Id(date, groomer.getId()).stream()
                   .map(this::toResponse)
                   .toList();
        }

        return List.of();

    }

    public List<VisitResponse> findByDateRange(LocalDate from, LocalDate to) {
        if (to.isBefore(from)) {
            throw new InvalidDataException("Invalid date range");
        }
        if (from.plusMonths(3).isBefore(to)) {
            throw new InvalidDataException("Date range too large");
        }
        if(AuthSupport.hasRole("RECEPTION") || AuthSupport.hasRole("ADMIN")) {
            return visitRepository.findByDateBetween(from, to).stream()
                    .map(this::toResponse)
                    .toList();
        }

        if(AuthSupport.hasRole("GROOMER")) {
            GroomerProfile groomer = groomerProfileRepository.findByUserId(AuthSupport.currentUserId())
                    .orElseThrow(() -> new InvalidDataException("Groomer not found"));

            return visitRepository.findByGroomer_IdAndDateBetween(groomer.getId(), from, to).stream()
                    .map(this::toResponse)
                    .toList();
        }

        return List.of();
    }

    public VisitResponse getById(Long id) {
        Visit visit = visitRepository.findById(id)
                .orElseThrow(() -> new VisitNotFoundException(id));

        boolean staffOverride = AuthSupport.hasRole("ADMIN") || AuthSupport.hasRole("RECEPTION");
        boolean isOwnVisit = visit.getGroomer().getUser() != null && AuthSupport.currentUserId().equals(visit.getGroomer().getUser().getId());

        if(!staffOverride && !isOwnVisit) {
            throw new InvalidDataException("You are not authorized to view this visit");
        }

        return toResponse(visit);
    }

    public List<VisitResponse> findForUser(Long userId) {
        return visitRepository.findByPet_Customer_User_Id(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<DayAvailabilityDto> getGroomerAvailability(Long groomerId, LocalDate from, LocalDate to) {
        GroomerProfile groomer = groomerProfileRepository.findById(groomerId)
                .orElseThrow(() -> new InvalidDataException("Groomer not found"));
        if (!groomer.isActive()) {
            throw new InvalidDataException("Groomer is not active");
        }
        if (to.isBefore(from)) {
            throw new InvalidDataException("Invalid date range");
        }
        if (from.plusMonths(3).isBefore(to)) {
            throw new InvalidDataException("Date range too large");
        }

        LocalDate today = LocalDate.now();
        List<Visit> booked = visitRepository.findByGroomer_IdAndDateBetween(groomerId, from, to);
        Set<String> taken = new HashSet<>();
        for (Visit visit : booked) {
            if (visit.getStatus() == VisitStatus.CANCELLED) {
                continue;
            }
            taken.add(visit.getDate() + "|" + visit.getTimeSlot().name());
        }

        List<DayAvailabilityDto> days = new ArrayList<>();
        for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
            boolean open = isSalonOpen(day) && !day.isBefore(today);
            List<SlotAvailabilityDto> slots = new ArrayList<>();
            int availableCount = 0;
            for (TimeSlot slot : TimeSlot.values()) {
                boolean available = open && !taken.contains(day + "|" + slot.name());
                if (available) {
                    availableCount++;
                }
                slots.add(new SlotAvailabilityDto(slot.name(), formatSlotLabel(slot), available));
            }
            days.add(new DayAvailabilityDto(day, open, availableCount, slots));
        }
        return days;
    }

    private static boolean isSalonOpen(LocalDate day) {
        DayOfWeek dow = day.getDayOfWeek();
        return dow != DayOfWeek.SUNDAY;
    }

    private static String formatSlotLabel(TimeSlot slot) {
        return slot.name().replace("SLOT_", "").replace('_', ':');
    }

    @Transactional
    public VisitResponse book(VisitRequest request) {
        Pet pet = petRepository.findById(request.petId())
                .orElseThrow(() -> new PetNotFoundException(request.petId()));

        GroomerProfile groomer = groomerProfileRepository.findById(request.groomerId())
                .orElseThrow(() -> new InvalidDataException("Groomer not found"));

        if(!groomer.isActive()) {
            throw new InvalidDataException("Groomer is not active");
        }

        if(visitRepository.existsByDateAndGroomer_IdAndTimeSlotAndStatusNot(request.date(), request.groomerId(),
                request.timeSlot(), VisitStatus.CANCELLED)) {
            throw new SlotConflictException("Visit already exists for this date and groomer");
        }

        Visit visit = new Visit();
        visit.setDate(request.date());
        visit.setTimeSlot(request.timeSlot());
        visit.setGroomer(groomer);
        visit.setPet(pet);
        visit.setServiceType(request.serviceType());
        visit.setStatus(VisitStatus.PLANNED);
        visit.setOwnerExpectations(request.ownerExpectations());

        visit = visitRepository.save(visit);
        return toResponse(visit);
    }

    @Transactional
    public VisitResponse bookForUser(Long userId, VisitRequest request) {
        Pet pet = petRepository.findById(request.petId())
                .orElseThrow(() -> new PetNotFoundException(request.petId()));

        var user = pet.getCustomer().getUser();

        if(user == null || user.getId() != userId ) {
            throw new InvalidDataException("Pet does not belong to this user");
        }

        return book(request);
   }

   @Transactional
   public VisitResponse updateStatus(Long id, VisitStatus status) {
       Visit visit = visitRepository.findById(id)
               .orElseThrow(() -> new VisitNotFoundException(id));
       boolean staffOverride = AuthSupport.hasRole("ADMIN") || AuthSupport.hasRole("RECEPTION");
       boolean isOwnVisit = visit.getGroomer().getUser() != null && AuthSupport.currentUserId().equals(visit.getGroomer().getUser().getId());

       if(!staffOverride && !isOwnVisit) {
           throw new InvalidDataException("You are not authorized to update this visit");
       }
       visit.setStatus(status);
       visit = visitRepository.save(visit);
       return toResponse(visit);
   }

   @Transactional
   public VisitResponse cancelForUser(Long userId, Long visitId) {
        Visit visit = visitRepository.findById(visitId)
               .orElseThrow(() -> new VisitNotFoundException(visitId));

        var user = visit.getPet().getCustomer().getUser();
        if(user == null || user.getId() != userId) {
            throw new InvalidDataException("Visit does not belong to this user");
        }

        if(visit.getStatus() != VisitStatus.PLANNED) {
            throw new InvalidDataException("Only planned visits can be cancelled");
        }

        visit.setStatus(VisitStatus.CANCELLED);
        visit = visitRepository.save(visit);
        return toResponse(visit);
   }


    @Transactional
    public VisitResponse reschedule(Long id, LocalDate date, TimeSlot timeSlot, Long groomerId) {
        Visit visit = visitRepository.findById(id)
                .orElseThrow(() -> new VisitNotFoundException(id));

        if (visit.getStatus() == VisitStatus.CANCELLED || visit.getStatus() == VisitStatus.COMPLETED) {
            throw new InvalidDataException("Cannot reschedule cancelled or completed visit");
        }

        GroomerProfile groomer = groomerProfileRepository.findById(groomerId)
                .orElseThrow(() -> new InvalidDataException("Groomer not found"));

        boolean sameSlot = visit.getDate().equals(date)
                && visit.getTimeSlot() == timeSlot
                && visit.getGroomer().getId() == groomerId;

        if (!sameSlot && visitRepository.existsByDateAndGroomer_IdAndTimeSlotAndStatusNot(
                date, groomerId, timeSlot, VisitStatus.CANCELLED)) {
            throw new InvalidDataException("Time slot already booked");
        }

        visit.setDate(date);
        visit.setTimeSlot(timeSlot);
        visit.setGroomer(groomer);
        visit = visitRepository.save(visit);
        return toResponse(visit);
    }

    private VisitResponse toResponse(Visit visit) {
        var customer = visit.getPet().getCustomer();
        String customerName = (customer.getFirstName() + " " + customer.getLastName()).trim();
        return new VisitResponse(
                visit.getId(),
                visit.getDate(),
                visit.getTimeSlot(),
                visit.getGroomer().getId(),
                visit.getGroomer().getDisplayName(),
                visit.getPet().getId(),
                visit.getPet().getName(),
                visit.getPet().getBreedText(),
                visit.getPet().getNotes(),
                customer.getId(),
                customerName,
                customer.getPhoneNumber(),
                visit.getServiceType(),
                visit.getStatus(),
                visit.getOwnerExpectations(),
                visit.getGroomerNotes()
        );
    }
}
