package com.dibladi.dibladibackend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReviewCreateRequest(
        @NotNull(message = "Le produit est obligatoire.") Long productId,
        @NotNull(message = "La note est obligatoire.")
        @Min(value = 1, message = "La note doit être comprise entre 1 et 5.")
        @Max(value = 5, message = "La note doit être comprise entre 1 et 5.") Integer rating,
        String comment
) {
}
