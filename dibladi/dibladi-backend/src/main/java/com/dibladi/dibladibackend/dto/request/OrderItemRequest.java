package com.dibladi.dibladibackend.dto.request;

import lombok.Data;

@Data
public class OrderItemRequest {
    private Long productId;
    private Long variantId;
    private Integer quantity;
}
