package com.alex.webgroomerapp.service;

import com.alex.webgroomerapp.dto.BreedPriceDto;
import com.alex.webgroomerapp.dto.PriceListItemRequest;
import com.alex.webgroomerapp.dto.PriceListItemResponse;
import com.alex.webgroomerapp.exceptions.InvalidDataException;
import com.alex.webgroomerapp.model.PriceListItem;
import com.alex.webgroomerapp.repo.IPriceListItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PriceListService {

    private final IPriceListItemRepository priceListItemRepository;

    public PriceListService(IPriceListItemRepository priceListItemRepository) {
        this.priceListItemRepository = priceListItemRepository;
    }

    @Transactional
    public List<PriceListItemResponse> findActive() {
        return priceListItemRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PriceListItemResponse create(PriceListItemRequest request) {
        PriceListItem item = new PriceListItem();
        apply(item, request);
        item = priceListItemRepository.save(item);
        return toResponse(item);
    }

    @Transactional
    public PriceListItemResponse update(Long id, PriceListItemRequest request) {
        PriceListItem item = priceListItemRepository.findById(id)
                .orElseThrow(() -> new InvalidDataException("Item not found: " + id));
        apply(item, request);
        item = priceListItemRepository.save(item);
        return toResponse(item);
    }

    @Transactional
    public List<PriceListItemResponse> findAllAdmin() {
        return priceListItemRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private void apply(PriceListItem item, PriceListItemRequest request) {
        item.setName(request.name());
        item.setDescription(request.description());
        item.setIndicativePriceFrom(request.indicativePriceFrom());
        item.setIndicativePriceTo(request.indicativePriceTo());
        item.setActive(request.active() == null || request.active());
    }

    private PriceListItemResponse toResponse(PriceListItem item) {
        List<BreedPriceDto> breeds = item.getBreedPrices().stream()
                .map(b -> new BreedPriceDto(b.getBreed(), b.getPriceFrom(), b.getPriceTo()))
                .toList();

        return new PriceListItemResponse(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getIndicativePriceFrom(),
                item.getIndicativePriceTo(),
                item.isActive(),
                breeds
        );
    }
}
