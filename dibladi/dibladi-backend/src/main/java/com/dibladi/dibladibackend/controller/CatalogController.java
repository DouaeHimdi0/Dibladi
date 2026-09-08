package com.dibladi.dibladibackend.controller;

import com.dibladi.dibladibackend.dto.CategoryResponse;
import com.dibladi.dibladibackend.dto.ProductResponse;
import com.dibladi.dibladibackend.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(catalogService.getCategories());
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getProducts(
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "categorySlug", required = false) String categorySlug,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "parentCategorySlug", required = false) String parentCategorySlug,
            @RequestParam(name = "parentCategoryId", required = false) Long parentCategoryId,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "brand", required = false) String brand,
            @RequestParam(name = "minRating", required = false) Double minRating,
            @RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(name = "inStockOnly", required = false) Boolean inStockOnly,
            @RequestParam(name = "onSale", required = false) Boolean onSale) {
        return ResponseEntity.ok(catalogService.getProducts(category, categorySlug, categoryId, parentCategorySlug, parentCategoryId, search, brand, minRating, minPrice, maxPrice, inStockOnly, onSale));
    }
}
