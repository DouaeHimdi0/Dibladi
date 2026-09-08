package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.dto.request.ProductVariantRequest;
import com.dibladi.dibladibackend.dto.response.ProductVariantResponse;
import com.dibladi.dibladibackend.entity.Product;
import com.dibladi.dibladibackend.entity.ProductVariant;
import com.dibladi.dibladibackend.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {
    private final ProductVariantRepository productVariantRepository;

    @Override
    public List<ProductVariantResponse> getVariantsByProduct(Long productId) {
        return productVariantRepository.findByProductIdOrderByIdAsc(productId).stream()
                .map(ProductVariantResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public ProductVariant createVariant(Product product, ProductVariantRequest request) {
        if (request.getCombinationLabel() == null || request.getCombinationLabel().isBlank()) {
            throw new IllegalArgumentException("La combinaison de variante est obligatoire.");
        }
        if (request.getPrice() == null || request.getPrice().signum() < 0) {
            throw new IllegalArgumentException("Le prix de la variante est invalide.");
        }
        int stock = request.getStockQuantity() == null ? 0 : request.getStockQuantity();
        if (stock < 0) {
            throw new IllegalArgumentException("Le stock de la variante est invalide.");
        }
        boolean available = stock > 0;
        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .combinationLabel(request.getCombinationLabel())
                .price(request.getPrice())
                .stockQuantity(stock)
                .isAvailable(available)
                .build();
        return productVariantRepository.save(variant);
    }

    @Override
    @Transactional
    public void deleteVariantsByProduct(Long productId) {
        productVariantRepository.deleteByProductId(productId);
    }

    @Override
    @Transactional
    public void updateVariantAvailability(Long variantId, Boolean isAvailable) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new IllegalArgumentException("Variante introuvable."));
        variant.setIsAvailable(variant.getStockQuantity() > 0);
        productVariantRepository.save(variant);
    }

    @Override
    @Transactional
    public ProductVariantResponse updateVariant(Long variantId, ProductVariantRequest request) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new IllegalArgumentException("Variante introuvable."));
        if (request.getCombinationLabel() != null) {
            variant.setCombinationLabel(request.getCombinationLabel());
        }
        if (request.getPrice() != null) {
            variant.setPrice(request.getPrice());
        }
        if (request.getStockQuantity() != null) {
            if (request.getStockQuantity() < 0) {
                throw new IllegalArgumentException("Le stock de la variante est invalide.");
            }
            variant.setStockQuantity(request.getStockQuantity());
        }
        variant.setIsAvailable(variant.getStockQuantity() > 0);
        return ProductVariantResponse.from(productVariantRepository.save(variant));
    }
}
