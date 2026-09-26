package com.alex.webgroomerapp.repo;

import com.alex.webgroomerapp.model.GroomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IGroomerProfileRepository extends JpaRepository<GroomerProfile, Long> {
    List<GroomerProfile> findByActiveTrue();

    Optional<GroomerProfile> findByUserId(Long userId);
}
