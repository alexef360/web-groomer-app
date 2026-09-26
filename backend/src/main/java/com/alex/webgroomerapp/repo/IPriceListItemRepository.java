package com.alex.webgroomerapp.repo;

import com.alex.webgroomerapp.model.PriceListItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IPriceListItemRepository extends JpaRepository<PriceListItem, Long> {
    List<PriceListItem> findByActiveTrue();
}
