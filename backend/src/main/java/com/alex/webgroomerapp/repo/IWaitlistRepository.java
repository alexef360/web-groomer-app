package com.alex.webgroomerapp.repo;

import com.alex.webgroomerapp.model.WaitlistEntry;
import com.alex.webgroomerapp.model.WaitlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IWaitlistRepository extends JpaRepository<WaitlistEntry, Long> {
    List<WaitlistEntry> findByStatusOrderByPriorityDescCreatedAtAsc(WaitlistStatus status);

    List<WaitlistEntry> findAllByOrderByPriorityDescCreatedAtAsc();
}
