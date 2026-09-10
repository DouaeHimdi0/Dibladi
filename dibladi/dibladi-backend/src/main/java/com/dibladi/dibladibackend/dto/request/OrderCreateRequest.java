package com.dibladi.dibladibackend.dto.request;

import lombok.Data;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

@Data
public class OrderCreateRequest {
    @NotEmpty(message = "La commande doit contenir au moins un article.")
    @Valid
    private List<OrderItemRequest> items;
    @NotBlank @Size(max = 100)
    private String deliveryFirstName;
    @NotBlank @Size(max = 100)
    private String deliveryLastName;
    @NotBlank @Size(max = 255)
    private String deliveryAddress;
    @NotBlank @Size(max = 100)
    private String deliveryCity;
    @NotBlank @Size(max = 20)
    private String deliveryPostalCode;
    @NotBlank @Size(max = 30)
    private String deliveryPhone;
}
