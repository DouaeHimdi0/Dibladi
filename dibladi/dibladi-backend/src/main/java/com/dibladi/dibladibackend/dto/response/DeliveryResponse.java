package com.dibladi.dibladibackend.dto.response;

import com.dibladi.dibladibackend.entity.Delivery;
import com.dibladi.dibladibackend.enums.DeliveryStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class DeliveryResponse {
    private Long id;
    private String deliveryNumber;
    private String vendorAddress;
    private String vendorCity;
    private String clientAddress;
    private String clientCity;
    private String clientName;
    private DeliveryStatus status;
    private BigDecimal orderAmount;
    private LocalDateTime createdAt;

    public static DeliveryResponse from(Delivery delivery) {
        return DeliveryResponse.builder()
                .id(delivery.getId())
                .deliveryNumber(delivery.getDeliveryNumber())
                .vendorAddress(delivery.getVendorAddress())
                .vendorCity(delivery.getVendorCity())
                .clientAddress(delivery.getClientAddress())
                .clientCity(delivery.getClientCity())
                .clientName(delivery.getClientName())
                .status(delivery.getStatus())
                .orderAmount(delivery.getOrderAmount())
                .createdAt(delivery.getCreatedAt())
                .build();
    }
}
