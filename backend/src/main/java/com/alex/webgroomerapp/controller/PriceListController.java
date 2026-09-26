package com.alex.webgroomerapp.controller;

import com.alex.webgroomerapp.dto.PriceListItemResponse;
import com.alex.webgroomerapp.service.PriceListService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pricing")
public class PriceListController {

    private final PriceListService priceListService;

    public PriceListController(PriceListService priceListService){
        this.priceListService = priceListService;
    }

    @GetMapping
    public List<PriceListItemResponse> list(){
        return priceListService.findActive();
    }
}
