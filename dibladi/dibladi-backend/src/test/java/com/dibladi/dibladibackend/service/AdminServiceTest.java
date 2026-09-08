package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.dto.response.DeliveryResponse;
import com.dibladi.dibladibackend.entity.Delivery;
import com.dibladi.dibladibackend.entity.Order;
import com.dibladi.dibladibackend.enums.DeliveryStatus;
import com.dibladi.dibladibackend.enums.OrderStatus;
import com.dibladi.dibladibackend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminServiceTest {

    private VendorRepository vendorRepository;
    private ClientRepository clientRepository;
    private OrderRepository orderRepository;
    private OrderService orderService; // will pass null to AdminService (not needed for these tests)
    private DeliveryRepository deliveryRepository;
    private VendorRequestRepository vendorRequestRepository;
    private ProductRepository productRepository;
    private OrderItemRepository orderItemRepository;
    private UserRepository userRepository;
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private EmailService emailService;

    private AdminService adminService;

    @BeforeEach
    void setUp() {
        vendorRepository = mock(VendorRepository.class);
        clientRepository = mock(ClientRepository.class);
        orderRepository = mock(OrderRepository.class);
        // avoid mocking OrderService to prevent Byte Buddy issues on Java 25
        orderService = null;
        deliveryRepository = mock(DeliveryRepository.class);
        vendorRequestRepository = mock(VendorRequestRepository.class);
        productRepository = mock(ProductRepository.class);
        orderItemRepository = mock(OrderItemRepository.class);
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(org.springframework.security.crypto.password.PasswordEncoder.class);
        emailService = null;

        adminService = new AdminService(vendorRepository, clientRepository, orderRepository, orderService,
            deliveryRepository, vendorRequestRepository, productRepository, orderItemRepository,
            userRepository, passwordEncoder, emailService);
    }

    @Test
    void updateDeliveryStatus_refused_propagatesToOrderCancelled() {
        Order order = new Order();
        order.setId(42L);
        order.setStatus(OrderStatus.PENDING);

        Delivery delivery = new Delivery();
        delivery.setId(1L);
        delivery.setOrder(order);

        when(deliveryRepository.findById(1L)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(orderRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        DeliveryResponse result = adminService.updateDeliveryStatus(1L, DeliveryStatus.REFUSED);

        assertNotNull(result);
        assertEquals(DeliveryStatus.REFUSED, result.getStatus());
        assertEquals(OrderStatus.CANCELLED, order.getStatus());

        verify(orderRepository, times(1)).save(order);
        verify(deliveryRepository, times(1)).save(delivery);
    }

    @Test
    void updateDeliveryStatus_delivered_propagatesToOrderDelivered() {
        Order order = new Order();
        order.setId(43L);
        order.setStatus(OrderStatus.PENDING);

        Delivery delivery = new Delivery();
        delivery.setId(2L);
        delivery.setOrder(order);

        when(deliveryRepository.findById(2L)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(orderRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        DeliveryResponse result = adminService.updateDeliveryStatus(2L, DeliveryStatus.DELIVERED);

        assertNotNull(result);
        assertEquals(DeliveryStatus.DELIVERED, result.getStatus());
        assertEquals(OrderStatus.DELIVERED, order.getStatus());

        verify(orderRepository, times(1)).save(order);
        verify(deliveryRepository, times(1)).save(delivery);
    }

    @Test
    void updateDeliveryStatus_inProgress_setsOrderPending() {
        Order order = new Order();
        order.setId(44L);
        order.setStatus(OrderStatus.CONFIRMED);

        Delivery delivery = new Delivery();
        delivery.setId(3L);
        delivery.setOrder(order);

        when(deliveryRepository.findById(3L)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(orderRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        DeliveryResponse result = adminService.updateDeliveryStatus(3L, DeliveryStatus.IN_PROGRESS);

        assertNotNull(result);
        assertEquals(DeliveryStatus.IN_PROGRESS, result.getStatus());
        assertEquals(OrderStatus.PENDING, order.getStatus());

        verify(orderRepository, times(1)).save(order);
        verify(deliveryRepository, times(1)).save(delivery);
    }
}
