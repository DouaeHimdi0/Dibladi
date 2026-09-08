package com.dibladi.dibladibackend.controller;

import com.dibladi.dibladibackend.dto.BrandResponse;
import com.dibladi.dibladibackend.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<List<BrandResponse>> getBrands() {
        return ResponseEntity.ok(brandService.getActiveBrands());
    }
}
