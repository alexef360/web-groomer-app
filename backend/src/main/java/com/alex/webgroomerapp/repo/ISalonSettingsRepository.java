package com.alex.webgroomerapp.repo;

import com.alex.webgroomerapp.model.SalonSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ISalonSettingsRepository extends JpaRepository<SalonSettings, Long> {
}
