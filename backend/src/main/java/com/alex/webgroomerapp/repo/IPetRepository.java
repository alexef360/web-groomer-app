package com.alex.webgroomerapp.repo;

import com.alex.webgroomerapp.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IPetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByCustomerId(Long customerId);
}
