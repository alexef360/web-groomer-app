package com.alex.webgroomerapp.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "visits")
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimeSlot timeSlot;

    @ManyToOne(optional = false)
    @JoinColumn(name = "groomer_id")
    private GroomerProfile groomer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pet_id")
    private Pet pet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceType serviceType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitStatus status = VisitStatus.PLANNED;

    private String ownerExpectations;
    private String groomerNotes;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public TimeSlot getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(TimeSlot timeSlot) {
        this.timeSlot = timeSlot;
    }

    public GroomerProfile getGroomer() {
        return groomer;
    }

    public void setGroomer(GroomerProfile groomer) {
        this.groomer = groomer;
    }

    public Pet getPet() {
        return pet;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
    }

    public VisitStatus getStatus() {
        return status;
    }

    public void setStatus(VisitStatus status) {
        this.status = status;
    }

    public String getOwnerExpectations() {
        return ownerExpectations;
    }

    public void setOwnerExpectations(String ownerExpectations) {
        this.ownerExpectations = ownerExpectations;
    }

    public String getGroomerNotes() {
        return groomerNotes;
    }

    public void setGroomerNotes(String groomerNotes) {
        this.groomerNotes = groomerNotes;
    }
}
