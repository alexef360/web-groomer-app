package com.alex.webgroomerapp.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "price_breed_prices")
public class PriceBreedPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "price_list_item_id", nullable = false)
    private PriceListItem priceListItem;

    @Column(nullable = false)
    private String breed;

    @Column(nullable = false)
    private BigDecimal priceFrom;

    private BigDecimal priceTo;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public PriceListItem getPriceListItem() {
        return priceListItem;
    }

    public void setPriceListItem(PriceListItem priceListItem) {
        this.priceListItem = priceListItem;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public BigDecimal getPriceFrom() {
        return priceFrom;
    }

    public void setPriceFrom(BigDecimal priceFrom) {
        this.priceFrom = priceFrom;
    }

    public BigDecimal getPriceTo() {
        return priceTo;
    }

    public void setPriceTo(BigDecimal priceTo) {
        this.priceTo = priceTo;
    }
}
