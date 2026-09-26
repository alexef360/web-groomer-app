package com.alex.webgroomerapp.dto;

import java.math.BigDecimal;
import java.util.List;

public record PriceListItemResponse(
        Long id,
        String name,
        String description,
        BigDecimal indicativePriceFrom,
        BigDecimal indicativePriceTo,
        Boolean active,
        List<BreedPriceDto> breedPrices
) {
}
