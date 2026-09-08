package com.dibladi.dibladibackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

public record ProductUpdateRequest(
        @NotBlank(message = "Le nom du produit est obligatoire.") String name,
        @NotBlank(message = "La description est obligatoire.") String description,
        @NotNull(message = "Le prix est obligatoire.") @Positive(message = "Le prix doit être positif.") BigDecimal price,
        @NotNull(message = "Le stock est obligatoire.") Integer stockQuantity,
        @NotNull(message = "La catégorie est obligatoire.") Long categoryId,
        List<String> images
) {
}
