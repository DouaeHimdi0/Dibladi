package com.dibladi.dibladibackend.dto.response;

import com.dibladi.dibladibackend.entity.Order;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    @Data
    @Builder
    public static class ClientSummary {
        private Long id;
        private String firstName;
        private String lastName;
        private String phone;
        private String city;
        private String address;
    }

    private Long id;
    private String orderNumber;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal commission;
    private String deliveryFirstName;
    private String deliveryLastName;
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryPostalCode;
    private String deliveryPhone;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    private String deliveryStatus;

    // Client info (for admin view)
    private Long clientId;
    private String clientFirstName;
    private String clientLastName;
    private ClientSummary client;

    public static OrderResponse from(Order order, List<OrderItemResponse> items) {
        OrderResponseBuilder builder = OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .totalAmount(order.getTotalAmount())
                .commission(order.getCommission())
                .deliveryFirstName(order.getDeliveryFirstName())
                .deliveryLastName(order.getDeliveryLastName())
                .deliveryAddress(order.getDeliveryAddress())
                .deliveryCity(order.getDeliveryCity())
                .deliveryPostalCode(order.getDeliveryPostalCode())
                .deliveryPhone(order.getDeliveryPhone())
                .createdAt(order.getCreatedAt())
                .items(items != null ? items : List.of());

            // deliveryStatus will be set by the service if available

        if (order.getClient() != null) {
            builder.clientId(order.getClient().getId())
                   .clientFirstName(order.getClient().getFirstName())
                   .clientLastName(order.getClient().getLastName())
                   .client(ClientSummary.builder()
                           .id(order.getClient().getId())
                           .firstName(order.getClient().getFirstName())
                           .lastName(order.getClient().getLastName())
                           .phone(order.getClient().getPhone())
                           .address(order.getDeliveryAddress())
                           .city(order.getDeliveryCity())
                           .build());
        }

        return builder.build();
    }
}
