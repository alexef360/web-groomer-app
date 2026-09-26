package com.alex.webgroomerapp.controller;

import com.alex.webgroomerapp.dto.PriceListItemRequest;
import com.alex.webgroomerapp.dto.PriceListItemResponse;
import com.alex.webgroomerapp.service.PriceListService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pricing")
public class AdminPriceListController {

    private final PriceListService priceListService;

    public AdminPriceListController(PriceListService priceListService) {
        this.priceListService = priceListService;
    }

    @GetMapping
    public List<PriceListItemResponse> findAll(){
        return priceListService.findAllAdmin();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PriceListItemResponse create(@Valid @RequestBody PriceListItemRequest request){
        return priceListService.create(request);
    }

    @PutMapping("/{id}")
    public PriceListItemResponse update(@PathVariable Long id, @Valid @RequestBody PriceListItemRequest request){
        return priceListService.update(id, request);
    }
}
