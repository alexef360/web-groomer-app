package com.alex.webgroomerapp.dto;

import java.math.BigDecimal;

public record BreedPriceDto(String breed, BigDecimal priceFrom, BigDecimal priceTo) {
}
