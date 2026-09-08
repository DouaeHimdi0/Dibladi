package com.dibladi.dibladibackend.controller;

import com.dibladi.dibladibackend.dto.ProductCreateRequest;
import com.dibladi.dibladibackend.dto.ProductResponse;
import com.dibladi.dibladibackend.dto.ProductUpdateRequest;
import com.dibladi.dibladibackend.entity.Product;
import com.dibladi.dibladibackend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication != null ? authentication.getName() : null;

        ProductResponse response = productService.createProduct(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

        @PutMapping("/{id}")
        public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable("id") Long id,
            @Valid @RequestBody ProductUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication != null ? authentication.getName() : null;

        ProductResponse response = productService.updateProduct(id, request, email);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication != null ? authentication.getName() : null;

        productService.deleteProduct(id, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/vendor/me")
    public ResponseEntity<List<ProductResponse>> getMyProducts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication != null ? authentication.getName() : null;

        return ResponseEntity.ok(productService.getProductsByVendorEmail(email));
    }
}
