package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.dto.request.ProductVariantRequest;
import com.dibladi.dibladibackend.dto.response.ProductVariantResponse;
import com.dibladi.dibladibackend.entity.Product;
import com.dibladi.dibladibackend.entity.ProductVariant;

import java.util.List;

public interface ProductVariantService {
    List<ProductVariantResponse> getVariantsByProduct(Long productId);
    ProductVariant createVariant(Product product, ProductVariantRequest request);
    void deleteVariantsByProduct(Long productId);
    void updateVariantAvailability(Long variantId, Boolean isAvailable);
    ProductVariantResponse updateVariant(Long variantId, ProductVariantRequest request);
}
