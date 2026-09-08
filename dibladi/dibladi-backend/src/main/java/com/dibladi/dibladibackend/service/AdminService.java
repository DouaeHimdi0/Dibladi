package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.dto.VendorResponse;
import com.dibladi.dibladibackend.dto.response.DeliveryResponse;
import com.dibladi.dibladibackend.entity.Delivery;
import com.dibladi.dibladibackend.entity.Order;
import com.dibladi.dibladibackend.entity.OrderItem;
import com.dibladi.dibladibackend.entity.Product;
import com.dibladi.dibladibackend.entity.User;
import com.dibladi.dibladibackend.entity.Vendor;
import com.dibladi.dibladibackend.entity.VendorRequest;
import com.dibladi.dibladibackend.enums.DeliveryStatus;
import com.dibladi.dibladibackend.enums.UserRole;
import com.dibladi.dibladibackend.enums.VendorRequestStatus;
import com.dibladi.dibladibackend.repository.ClientRepository;
import com.dibladi.dibladibackend.repository.DeliveryRepository;
import com.dibladi.dibladibackend.repository.OrderItemRepository;
import com.dibladi.dibladibackend.repository.OrderRepository;
import com.dibladi.dibladibackend.repository.ProductRepository;
import com.dibladi.dibladibackend.repository.UserRepository;
import com.dibladi.dibladibackend.repository.VendorRepository;
import com.dibladi.dibladibackend.repository.VendorRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import com.dibladi.dibladibackend.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final VendorRepository vendorRepository;
    private final ClientRepository clientRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final DeliveryRepository deliveryRepository;
    private final VendorRequestRepository vendorRequestRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // -------------------------------------------------------------------------
    // Dashboard & listes
    // -------------------------------------------------------------------------


    public Map<String, Object> getDashboard() {
        Map<String, Object> payload = new HashMap<>();
        List<Order> orders = orderRepository.findAll();
        List<VendorRequest> pendingRequests = vendorRequestRepository.findAll().stream()
                .filter(r -> r.getStatus() != null && r.getStatus().name().equals("PENDING"))
                .collect(Collectors.toList());

        BigDecimal turnoverTotal = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> orderStatusCounts = orders.stream()
                .collect(Collectors.groupingBy(order -> order.getStatus().name(), Collectors.counting()));

        payload.put("activeVendors", vendorRepository.findAll().size());
        payload.put("clientsCount", clientRepository.findAll().size());
        payload.put("activeProductsCount", productRepository.countByIsActiveTrue());
        payload.put("ordersCount", orders.size());
        payload.put("deliveriesCount", deliveryRepository.findAll().size());
        payload.put("pendingRequests", pendingRequests.size());
        payload.put("turnoverTotal", turnoverTotal);
        payload.put("orderStatusCounts", orderStatusCounts);
                // Map orders to simple serializable objects preserving a nested `client` object
                List<Map<String, Object>> serialOrders = orders.stream().map(order -> {
                        Map<String, Object> o = new HashMap<>();
                        o.put("id", order.getId());
                        o.put("orderNumber", order.getOrderNumber());
                        o.put("status", order.getStatus() != null ? order.getStatus().name() : null);
                        o.put("totalAmount", order.getTotalAmount());
                        o.put("commission", order.getCommission());
                        o.put("deliveryFirstName", order.getDeliveryFirstName());
                        o.put("deliveryLastName", order.getDeliveryLastName());
                        o.put("deliveryAddress", order.getDeliveryAddress());
                        o.put("deliveryCity", order.getDeliveryCity());
                        o.put("deliveryPostalCode", order.getDeliveryPostalCode());
                        o.put("deliveryPhone", order.getDeliveryPhone());
                        o.put("createdAt", order.getCreatedAt());

                        if (order.getClient() != null) {
                                Map<String, Object> clientMap = new HashMap<>();
                                clientMap.put("id", order.getClient().getId());
                                clientMap.put("firstName", order.getClient().getFirstName());
                                clientMap.put("lastName", order.getClient().getLastName());
                                o.put("client", clientMap);
                        } else {
                                o.put("client", null);
                        }

                        return o;
                }).collect(Collectors.toList());

                payload.put("orders", serialOrders);
        return payload;
    }


        public List<VendorResponse> getVendors() {
                LocalDateTime fortyEightHoursAgo = LocalDateTime.now().minusHours(48);
        List<Vendor> vendors = vendorRepository.findAll();
        List<Product> allProducts = productRepository.findAll();
        List<OrderItem> allOrderItems = orderItemRepository.findAll();

        return vendors.stream().map(vendor -> {
            long activeProductsCount = allProducts.stream()
                    .filter(p -> p.getVendor() != null && Objects.equals(p.getVendor().getId(), vendor.getId()))
                    .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                    .count();

            List<OrderItem> vendorItems = allOrderItems.stream()
                    .filter(oi -> oi.getVendor() != null && Objects.equals(oi.getVendor().getId(), vendor.getId()))
                    .collect(Collectors.toList());

            long totalOrdersCount = vendorItems.stream()
                    .map(oi -> oi.getOrder().getId())
                    .distinct()
                    .count();

            long last48hOrdersCount = vendorItems.stream()
                    .filter(oi -> oi.getOrder() != null && oi.getOrder().getCreatedAt() != null && oi.getOrder().getCreatedAt().isAfter(fortyEightHoursAgo))
                    .map(oi -> oi.getOrder().getId())
                    .distinct()
                    .count();

            return VendorResponse.from(vendor, activeProductsCount, totalOrdersCount, last48hOrdersCount);
        }).collect(Collectors.toList());
    }

        public com.dibladi.dibladibackend.entity.Client getClientById(Long id) {
                return clientRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Client not found with id: " + id));
        }

        public com.dibladi.dibladibackend.dto.response.OrderResponse getOrderById(Long id) {
                return orderService.getAllOrderResponses().stream()
                                .filter(o -> o.getId() != null && o.getId().equals(id))
                                .findFirst()
                                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));
        }

        public com.dibladi.dibladibackend.dto.response.OrderResponse getOrderByOrderNumber(String orderNumber) {
                return orderService.getAllOrderResponses().stream()
                                .filter(o -> o.getOrderNumber() != null && o.getOrderNumber().equals(orderNumber))
                                .findFirst()
                                .orElseThrow(() -> new IllegalArgumentException("Order not found with orderNumber: " + orderNumber));
        }

    public List<com.dibladi.dibladibackend.dto.response.ClientSummaryResponse> getClients() {
        Map<Long, Order> latestOrderByClientId = orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(order -> order.getClient() != null && order.getClient().getId() != null)
                .collect(Collectors.toMap(
                        order -> order.getClient().getId(),
                        order -> order,
                        (existing, replacement) -> existing,
                        HashMap::new
                ));

        return clientRepository.findAll().stream()
                .map(client -> {
                    Order latestOrder = latestOrderByClientId.get(client.getId());
                    return com.dibladi.dibladibackend.dto.response.ClientSummaryResponse.builder()
                            .id(client.getId())
                            .firstName(client.getFirstName())
                            .lastName(client.getLastName())
                            .fullName(client.getFirstName() + " " + client.getLastName())
                            .phone(client.getPhone())
                            .city(latestOrder != null ? latestOrder.getDeliveryCity() : null)
                            .address(latestOrder != null ? latestOrder.getDeliveryAddress() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrders() {
        return orderService.getAllOrderResponses();
    }

public List<DeliveryResponse> getDeliveries() {
        return deliveryRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(DeliveryResponse::from)
                .toList();
    }

    @Transactional
    public DeliveryResponse updateDeliveryStatus(Long id, DeliveryStatus status) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found with id: " + id));
        delivery.setStatus(status);
        // propagate to order status so clients and vendors see the updated status
        Order order = delivery.getOrder();
        if (order != null) {
            switch (status) {
                case DELIVERED:
                    order.setStatus(com.dibladi.dibladibackend.enums.OrderStatus.DELIVERED);
                    break;
                case REFUSED:
                    order.setStatus(com.dibladi.dibladibackend.enums.OrderStatus.CANCELLED);
                    break;
                default:
                    order.setStatus(com.dibladi.dibladibackend.enums.OrderStatus.PENDING);
                    break;
            }
            orderRepository.save(order);
        }

        return DeliveryResponse.from(deliveryRepository.save(delivery));
    }

    public Page<VendorRequest> getVendorRequests(Pageable pageable) {
        return vendorRequestRepository.findAll(pageable);
    }

    public List<VendorRequest> getVendorRequests() {
        return vendorRequestRepository.findAll();
    }

    public Map<String, String> updateVendorScore(Long id, Integer score) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found with id: " + id));
                if (score == null) {
                        throw new IllegalArgumentException("Score must be provided");
                }
                if (score < 0 || score > 100) {
                        throw new IllegalArgumentException("Score must be between 0 and 100");
                }
                vendor.setScore(score);
        vendorRepository.save(vendor);
        return Map.of("message", "Score mis à jour avec succès.");
    }


    // -------------------------------------------------------------------------
    // Approbation d'une demande vendeur
    // -------------------------------------------------------------------------

    /**
     * Approuve une VendorRequest :
     * 1. Génère un mot de passe temporaire lisible (12 chars, sans caractères ambigus)
     * 2. Crée un User (email + mot de passe hashé + rôle VENDOR)
     * 3. Crée un Vendor lié, avec isApproved = true
     * 4. Met à jour la VendorRequest : status = APPROVED, processedAt = now()
     * 5. Envoie un email au vendeur avec ses identifiants
     */
    @Transactional
    public Map<String, String> approveVendorRequest(Long id) {
        VendorRequest vendorRequest = vendorRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable avec l'id : " + id));

        if (vendorRequest.getStatus() != VendorRequestStatus.PENDING) {
            throw new IllegalStateException(
                    "Cette demande a déjà été traitée (statut : " + vendorRequest.getStatus() + ").");
        }

                String initialPassword = vendorRequest.getPassword();
                String encodedPassword;
                String temporaryPlainPassword = "";

                if (initialPassword != null && !initialPassword.isBlank()) {
                        // If the stored vendorRequest password already looks like a BCrypt hash, keep it as-is.
                        if (initialPassword.startsWith("$2")) {
                                encodedPassword = initialPassword;
                        } else {
                                // The request stored a plain password (older behaviour or unexpected): encode it once.
                                encodedPassword = passwordEncoder.encode(initialPassword);
                        }
                } else {
                        // No password provided in the request: generate a deterministic temporary plain password,
                        // encode it and return the plain value so the admin/vendor can use it.
                        temporaryPlainPassword = "Dib" + (1000 + (int) (Math.random() * 9000));
                        encodedPassword = passwordEncoder.encode(temporaryPlainPassword);
                }

        // 2. Création du compte User avec le mot de passe saisi à l'inscription (ou un mot de passe temporaire si absent)
        User user = User.builder()
                .email(vendorRequest.getEmail())
                .password(encodedPassword)
                .role(UserRole.VENDOR)
                .build();
        userRepository.save(user);
        log.info("[AdminService] Compte User VENDOR créé pour : {}", user.getEmail());

        // 3. Création du Vendor lié à ce User
        Vendor vendor = Vendor.builder()
                .user(user)
                .firstName(vendorRequest.getFirstName())
                .lastName(vendorRequest.getLastName())
                .phone(vendorRequest.getPhone())
                .shopName(vendorRequest.getShopName())
                .city(vendorRequest.getCity())
                .shopAddress(vendorRequest.getShopAddress())
                .socialLink(vendorRequest.getSocialLink())
                .instagramLink(vendorRequest.getInstagramLink())
                .photoUrl(vendorRequest.getPhotoUrl())
                .bankAccountHolderName(vendorRequest.getBankAccountHolderName())
                .bankName(vendorRequest.getBankName())
                .bankRib(vendorRequest.getBankRib())
                .score(0)
                .isApproved(true)
                .approvedAt(LocalDateTime.now())
                .build();
        vendorRepository.save(vendor);
        log.info("[AdminService] Profil Vendor créé pour : {}", vendor.getShopName());

        // 4. Mise à jour de la VendorRequest
        vendorRequest.setStatus(VendorRequestStatus.APPROVED);
        vendorRequest.setProcessedAt(LocalDateTime.now());
        vendorRequestRepository.save(vendorRequest);

        // 5. Envoi de l'email de confirmation d'approbation au vendeur
        emailService.sendVendorApprovalEmail(
                vendorRequest.getEmail(),
                vendorRequest.getFirstName()
        );

        return Map.of(
                "message", "Vendeur approuvé",
                "email", vendorRequest.getEmail(),
                "temporaryPassword", temporaryPlainPassword
        );
    }


    // -------------------------------------------------------------------------
    // Rejet d'une demande vendeur
    // -------------------------------------------------------------------------

    /**
     * Rejette une VendorRequest :
     * 1. Met à jour : status = REJECTED, processedAt = now()
     * 2. Envoie un email de refus simple et respectueux
     */
    @Transactional
    public Map<String, String> rejectVendorRequest(Long id) {
        VendorRequest vendorRequest = vendorRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable avec l'id : " + id));

        if (vendorRequest.getStatus() != VendorRequestStatus.PENDING) {
            throw new IllegalStateException(
                    "Cette demande a déjà été traitée (statut : " + vendorRequest.getStatus() + ").");
        }

        vendorRequest.setStatus(VendorRequestStatus.REJECTED);
        vendorRequest.setProcessedAt(LocalDateTime.now());
        vendorRequestRepository.save(vendorRequest);
        log.info("[AdminService] Demande rejetée pour : {}", vendorRequest.getEmail());

        // Envoi de l'email de refus (asynchrone)
        emailService.sendVendorRejectionEmail(
                vendorRequest.getEmail(),
                vendorRequest.getFirstName()
        );

        return Map.of("message", "Demande rejetée. Le candidat a été notifié par email.");
    }

}
