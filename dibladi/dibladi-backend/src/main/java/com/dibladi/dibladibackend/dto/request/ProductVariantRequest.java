package com.dibladi.dibladibackend.dto.request;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantRequest {
    private String combinationLabel;
    private BigDecimal price;
    private Integer stockQuantity;
    private Boolean isAvailable;
}
