package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.dto.request.OrderCreateRequest;
import com.dibladi.dibladibackend.dto.request.OrderItemRequest;
import com.dibladi.dibladibackend.dto.response.OrderItemResponse;
import com.dibladi.dibladibackend.dto.response.OrderResponse;
import com.dibladi.dibladibackend.entity.*;
import com.dibladi.dibladibackend.enums.DeliveryStatus;
import com.dibladi.dibladibackend.enums.OrderStatus;
import com.dibladi.dibladibackend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private static final BigDecimal DEFAULT_VENDOR_DELIVERY_FEE = BigDecimal.valueOf(40.00);
    private static final BigDecimal COMMISSION_RATE = BigDecimal.valueOf(0.05);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final DeliveryRepository deliveryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final VendorRepository vendorRepository;
    private final ProductVariantRepository productVariantRepository;

    // -------------------------------------------------------------------------
    // Conversion helpers
    // -------------------------------------------------------------------------

    private List<OrderResponse> toOrderResponses(List<Order> orders) {
        if (orders.isEmpty()) {
            return List.of();
        }

        List<Long> orderIds = orders.stream().map(Order::getId).collect(Collectors.toList());
        List<OrderItem> allItems = orderItemRepository.findByOrderIdIn(orderIds);

        // Fetch deliveries for these orders to include delivery status in responses
        List<Delivery> deliveries = deliveryRepository.findByOrderIdIn(orderIds);
        java.util.Map<Long, Delivery> deliveryByOrderId = deliveries.stream()
                .filter(d -> d.getOrder() != null && d.getOrder().getId() != null)
                .collect(Collectors.toMap(d -> d.getOrder().getId(), d -> d));

        // Group items by order ID
        Map<Long, List<OrderItemResponse>> itemsByOrderId = allItems.stream()
                .collect(Collectors.groupingBy(
                        item -> item.getOrder().getId(),
                        Collectors.mapping(OrderItemResponse::from, Collectors.toList())
                ));

        return orders.stream()
                .map(order -> {
                    OrderResponse resp = OrderResponse.from(order, itemsByOrderId.getOrDefault(order.getId(), List.of()));
                    Delivery delivery = deliveryByOrderId.get(order.getId());
                    if (delivery != null && delivery.getStatus() != null) {
                        resp.setDeliveryStatus(delivery.getStatus().name());
                    }
                    return resp;
                })
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // Read operations (return DTOs)
    // -------------------------------------------------------------------------

    public List<OrderResponse> getAllOrderResponses() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return toOrderResponses(orders);
    }

    public List<OrderResponse> getClientOrders(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Client client = clientRepository.findByUserId(user.getId()).orElseThrow(() -> new IllegalArgumentException("Client not found"));
        List<Order> orders = orderRepository.findByClientIdOrderByCreatedAtDesc(client.getId());
        return toOrderResponses(orders);
    }

    public List<OrderResponse> getVendorOrders(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Vendor vendor = vendorRepository.findByUserId(user.getId()).orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        List<Order> orders = orderRepository.findDistinctByItemsVendorIdOrderByCreatedAtDesc(vendor.getId());
        return toOrderResponses(orders);
    }

    public List<OrderResponse> searchClientOrders(String email, String query) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Client client = clientRepository.findByUserId(user.getId()).orElseThrow(() -> new IllegalArgumentException("Client not found"));
        List<Order> orders = orderRepository.findByOrderNumberContainingIgnoreCaseAndClientIdOrderByCreatedAtDesc(query, client.getId());
        return toOrderResponses(orders);
    }

    // -------------------------------------------------------------------------
    // Create order
    // -------------------------------------------------------------------------

    @Transactional
    public Map<String, String> createOrder(OrderCreateRequest request, String email) {
        if (request == null) {
            throw new IllegalArgumentException("Les données de commande sont obligatoires.");
        }
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Client client = clientRepository.findByUserId(user.getId()).orElseThrow(() -> new IllegalArgumentException("Client not found"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }
        if (request.getDeliveryFirstName() == null || request.getDeliveryLastName() == null
                || request.getDeliveryAddress() == null || request.getDeliveryCity() == null
                || request.getDeliveryPostalCode() == null || request.getDeliveryPhone() == null) {
            throw new IllegalArgumentException("Les informations de livraison sont obligatoires.");
        }

        String orderNumber = "DBD-" + System.currentTimeMillis();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .client(client)
                .status(OrderStatus.PENDING)
                .deliveryFirstName(request.getDeliveryFirstName())
                .deliveryLastName(request.getDeliveryLastName())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryCity(request.getDeliveryCity())
                .deliveryPostalCode(request.getDeliveryPostalCode())
                .deliveryPhone(request.getDeliveryPhone())
                .totalAmount(BigDecimal.ZERO)
                .commission(BigDecimal.ZERO)
                .build();

        orderRepository.save(order);

        BigDecimal sousTotal = BigDecimal.ZERO;
        Vendor firstVendor = null;
        Set<Long> vendorIds = new HashSet<>();

        for (OrderItemRequest itemRequest : request.getItems()) {
            if (itemRequest == null || itemRequest.getProductId() == null
                    || itemRequest.getQuantity() == null || itemRequest.getQuantity() <= 0) {
                throw new IllegalArgumentException("Chaque article doit avoir un produit et une quantité valide.");
            }
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemRequest.getProductId()));

            Vendor vendor = product.getVendor();
            if (vendor != null && vendor.getId() != null) {
                vendorIds.add(vendor.getId());
            }
            if (firstVendor == null) {
                firstVendor = vendor;
            }

            BigDecimal unitPrice = product.getPrice();
            ProductVariant variant = null;
            if (itemRequest.getVariantId() != null) {
                variant = productVariantRepository.findById(itemRequest.getVariantId())
                        .orElseThrow(() -> new IllegalArgumentException("Variante introuvable pour le produit."));
                if (variant.getProduct() == null || !variant.getProduct().getId().equals(product.getId())) {
                    throw new IllegalArgumentException("La variante ne correspond pas au produit commandé.");
                }
                if (!Boolean.TRUE.equals(variant.getIsAvailable()) || variant.getStockQuantity() < itemRequest.getQuantity()) {
                    throw new IllegalArgumentException("Stock insuffisant pour la variante sélectionnée.");
                }
                unitPrice = variant.getPrice();
            }
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            sousTotal = sousTotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .vendor(vendor)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(itemTotal)
                    .build();
            orderItemRepository.save(orderItem);

            if (variant != null) {
                variant.setStockQuantity(variant.getStockQuantity() - itemRequest.getQuantity());
                variant.setIsAvailable(variant.getStockQuantity() > 0);
                productVariantRepository.save(variant);
            } else if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException("Stock insuffisant pour le produit.");
            } else {
                product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
                product.setIsActive(product.getStockQuantity() > 0);
                productRepository.save(product);
            }
        }

        BigDecimal fraisLivraison = BigDecimal.valueOf(40).multiply(BigDecimal.valueOf(vendorIds.size()));
        BigDecimal totalAmount = sousTotal.add(fraisLivraison);

        order.setTotalAmount(totalAmount);
        order.setCommission(sousTotal.multiply(COMMISSION_RATE));
        orderRepository.save(order);

        Delivery delivery = Delivery.builder()
                .deliveryNumber("L-" + orderNumber)
                .order(order)
                .vendorAddress(firstVendor != null && firstVendor.getShopAddress() != null ? firstVendor.getShopAddress() : "N/A")
                .vendorCity(firstVendor != null && firstVendor.getCity() != null ? firstVendor.getCity() : "N/A")
                .clientAddress(request.getDeliveryAddress())
                .clientCity(request.getDeliveryCity())
                .clientName(request.getDeliveryFirstName() + " " + request.getDeliveryLastName())
                .status(DeliveryStatus.IN_PROGRESS)
                .orderAmount(totalAmount)
                .build();
        deliveryRepository.save(delivery);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Order created successfully");
        response.put("orderNumber", orderNumber);
        return response;
    }
}

