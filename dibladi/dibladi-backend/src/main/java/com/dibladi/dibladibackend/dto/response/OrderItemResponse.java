package com.dibladi.dibladibackend.dto.response;

import com.dibladi.dibladibackend.entity.OrderItem;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private String productImage;
    private String vendorShopName;
    private Long vendorId;
    private String vendorName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal deliveryFee;
    private BigDecimal totalPrice;

    public static OrderItemResponse from(OrderItem item) {
        String firstImage = null;
        if (item.getProduct() != null
                && item.getProduct().getImages() != null
                && !item.getProduct().getImages().isEmpty()) {
            firstImage = item.getProduct().getImages().get(0);
        }

        return OrderItemResponse.builder()
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProduct() != null ? item.getProduct().getName() : "Produit supprimé")
                .productImage(firstImage)
                .vendorShopName(item.getVendor() != null ? item.getVendor().getShopName() : null)
                .vendorId(item.getVendor() != null ? item.getVendor().getId() : null)
                .vendorName(item.getVendor() != null ? item.getVendor().getFirstName() + " " + item.getVendor().getLastName() : null)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .deliveryFee(item.getProduct() != null ? item.getProduct().getDeliveryFee() : null)
                .totalPrice(item.getTotalPrice())
                .build();
    }
}
