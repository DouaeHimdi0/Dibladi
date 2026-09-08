package com.dibladi.dibladibackend.controller;

import com.dibladi.dibladibackend.dto.request.OrderCreateRequest;
import com.dibladi.dibladibackend.dto.response.OrderResponse;
import com.dibladi.dibladibackend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Map<String, String>> createOrder(@RequestBody OrderCreateRequest request, Authentication authentication) {
        try {
            Map<String, String> response = orderService.createOrder(request, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        try {
            return ResponseEntity.ok(orderService.getClientOrders(authentication.getName()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/vendor-orders")
    public ResponseEntity<List<OrderResponse>> getVendorOrders(Authentication authentication) {
        try {
            return ResponseEntity.ok(orderService.getVendorOrders(authentication.getName()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<OrderResponse>> searchMyOrders(
            @RequestParam("query") String query,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(orderService.searchClientOrders(authentication.getName(), query));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}
