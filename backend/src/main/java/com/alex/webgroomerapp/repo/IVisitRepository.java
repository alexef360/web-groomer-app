package com.alex.webgroomerapp.repo;

import com.alex.webgroomerapp.model.TimeSlot;
import com.alex.webgroomerapp.model.Visit;
import com.alex.webgroomerapp.model.VisitStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface IVisitRepository extends JpaRepository<Visit, Long> {
    List<Visit> findByDate(LocalDate date);
    List<Visit> findByDateAndGroomer_Id(LocalDate date, Long groomerId);
    boolean existsByDateAndGroomer_IdAndTimeSlotAndStatusNot(LocalDate date, Long groomerId, TimeSlot timeSlot, VisitStatus visitStatus);
    List<Visit> findByPet_Customer_User_Id(Long userId);
    List<Visit> findByGroomer_IdAndDateBetween(Long groomerId, LocalDate from, LocalDate to);
    List<Visit> findByDateBetween(LocalDate from, LocalDate to);
}
