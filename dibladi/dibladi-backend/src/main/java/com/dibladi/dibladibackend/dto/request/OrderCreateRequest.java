package com.dibladi.dibladibackend.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class OrderCreateRequest {
    private List<OrderItemRequest> items;
    private String deliveryFirstName;
    private String deliveryLastName;
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryPostalCode;
    private String deliveryPhone;
}
