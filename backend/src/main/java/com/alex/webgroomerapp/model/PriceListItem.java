package com.alex.webgroomerapp.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "price_list_items")
public class PriceListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private BigDecimal indicativePriceFrom;

    private BigDecimal indicativePriceTo;

    private boolean active = true;

    @OneToMany(mappedBy = "priceListItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<PriceBreedPrice> breedPrices = new ArrayList<>();

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getIndicativePriceFrom() {
        return indicativePriceFrom;
    }

    public void setIndicativePriceFrom(BigDecimal indicativePriceFrom) {
        this.indicativePriceFrom = indicativePriceFrom;
    }

    public BigDecimal getIndicativePriceTo() {
        return indicativePriceTo;
    }

    public void setIndicativePriceTo(BigDecimal indicativePriceTo) {
        this.indicativePriceTo = indicativePriceTo;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<PriceBreedPrice> getBreedPrices() {
        return breedPrices;
    }

    public void setBreedPrices(List<PriceBreedPrice> breedPrices) {
        this.breedPrices = breedPrices;
    }

    public void addBreedPrice(String breed, BigDecimal from, BigDecimal to) {
        PriceBreedPrice row = new PriceBreedPrice();
        row.setPriceListItem(this);
        row.setBreed(breed);
        row.setPriceFrom(from);
        row.setPriceTo(to);
        breedPrices.add(row);
    }
}
