package com.dibladi.dibladibackend.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Data
public class OrderItemRequest {
    @NotNull
    private Long productId;
    private Long variantId;
    @NotNull @Positive
    private Integer quantity;
}
