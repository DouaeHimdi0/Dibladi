package com.dibladi.dibladibackend.controller;

import com.dibladi.dibladibackend.dto.request.ProductVariantRequest;
import com.dibladi.dibladibackend.dto.response.ProductVariantResponse;
import com.dibladi.dibladibackend.entity.Product;
import com.dibladi.dibladibackend.entity.ProductVariant;
import com.dibladi.dibladibackend.repository.ProductVariantRepository;
import com.dibladi.dibladibackend.repository.ProductRepository;
import com.dibladi.dibladibackend.service.ProductVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductVariantController {
    private final ProductVariantService productVariantService;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;

    private void verifyProductOwner(Product product, Authentication authentication) {
        if (product.getVendor() == null
                || product.getVendor().getUser() == null
                || authentication == null
                || !authentication.getName().equals(product.getVendor().getUser().getEmail())) {
            throw new AccessDeniedException("Vous n'êtes pas autorisé à modifier ce produit.");
        }
    }

    @GetMapping("/{id}/variants")
    public ResponseEntity<List<ProductVariantResponse>> getVariants(@PathVariable("id") Long id) {
        return ResponseEntity.ok(productVariantService.getVariantsByProduct(id));
    }

    @PutMapping("/{productId}/variants/{variantId}")
    @PreAuthorize("hasAuthority('VENDOR')")
    public ResponseEntity<ProductVariantResponse> updateVariant(
            @PathVariable("productId") Long productId,
            @PathVariable("variantId") Long variantId,
            @Valid @RequestBody ProductVariantRequest request,
            Authentication authentication) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new IllegalArgumentException("Variante introuvable."));
        if (variant.getProduct() == null || !productId.equals(variant.getProduct().getId())) {
            throw new IllegalArgumentException("La variante n'appartient pas à ce produit.");
        }
        verifyProductOwner(variant.getProduct(), authentication);
        return ResponseEntity.ok(productVariantService.updateVariant(variantId, request));
    }

    @PostMapping("/{productId}/variants")
    @PreAuthorize("hasAuthority('VENDOR')")
    public ResponseEntity<ProductVariantResponse> createVariant(
            @PathVariable("productId") Long productId,
            @Valid @RequestBody ProductVariantRequest request,
            Authentication authentication) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Produit introuvable."));
        verifyProductOwner(product, authentication);
        return ResponseEntity.ok(ProductVariantResponse.from(productVariantService.createVariant(product, request)));
    }
}
