package com.dibladi.dibladibackend.dto.response;

import com.dibladi.dibladibackend.entity.ProductVariant;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponse {
    private Long id;
    private String combinationLabel;
    private BigDecimal price;
    private Integer stockQuantity;
    private Boolean isAvailable;

    public static ProductVariantResponse from(ProductVariant variant) {
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .combinationLabel(variant.getCombinationLabel())
                .price(variant.getPrice())
                .stockQuantity(variant.getStockQuantity())
                .isAvailable(variant.getIsAvailable())
                .build();
    }
}
