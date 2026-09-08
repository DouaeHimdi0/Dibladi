package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.repository.CategoryRepository;
import com.dibladi.dibladibackend.repository.ProductRepository;
import com.dibladi.dibladibackend.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;

    @Override
    public Map<String, Object> globalSearch(String query) {
        if (query == null || query.isBlank()) {
            return Map.of("products", List.of(), "categories", List.of(), "vendors", List.of());
        }

        // 1. Products
        var products = productRepository.searchProducts(query, PageRequest.of(0, 5))
                .stream()
                .map(p -> Map.of(
                        "id", p.getId(),
                        "name", p.getName(),
                        "price", p.getPrice(),
                        "imageUrl", p.getImages() != null && !p.getImages().isEmpty() ? p.getImages().get(0) : "",
                        "type", "product"
                ))
                .toList();

        // 2. Categories
        var categories = categoryRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(query)
                .stream()
                .limit(3)
                .map(c -> Map.of(
                        "id", c.getId(),
                        "name", c.getName(),
                        "slug", c.getSlug(),
                        "type", "category"
                ))
                .toList();

        // 3. Vendors
        var vendors = vendorRepository.findByShopNameContainingIgnoreCaseAndIsApprovedTrue(query)
                .stream()
                .limit(3)
                .map(v -> Map.of(
                        "id", v.getId(),
                        "shopName", v.getShopName(),
                        "vendorId", v.getId(),
                        "type", "vendor"
                ))
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("products", products);
        result.put("categories", categories);
        result.put("vendors", vendors);

        return result;
    }
}
