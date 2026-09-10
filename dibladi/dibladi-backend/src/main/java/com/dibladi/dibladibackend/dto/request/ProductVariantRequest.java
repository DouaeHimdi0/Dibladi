package com.dibladi.dibladibackend.dto.request;

import lombok.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantRequest {
    @Size(max = 255)
    private String combinationLabel;
    @DecimalMin(value = "0.0")
    private BigDecimal price;
    @Min(0)
    private Integer stockQuantity;
    private Boolean isAvailable;
}
