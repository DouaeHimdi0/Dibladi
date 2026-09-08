package com.dibladi.dibladibackend.controller;

import com.dibladi.dibladibackend.dto.CategoryResponse;
import com.dibladi.dibladibackend.dto.VendorResponse;
import com.dibladi.dibladibackend.dto.request.CategoryRequest;
import com.dibladi.dibladibackend.dto.response.DeliveryResponse;
import com.dibladi.dibladibackend.dto.response.OrderResponse;
import com.dibladi.dibladibackend.entity.Delivery;
import com.dibladi.dibladibackend.entity.VendorRequest;
import com.dibladi.dibladibackend.enums.DeliveryStatus;
import com.dibladi.dibladibackend.service.AdminService;
import com.dibladi.dibladibackend.service.CategoryService;
import com.dibladi.dibladibackend.service.ParentCategoryService;
import com.dibladi.dibladibackend.dto.response.ParentCategoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final CategoryService categoryService;
    private final ParentCategoryService parentCategoryService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/vendors")
    public ResponseEntity<List<VendorResponse>> getVendors() {
        return ResponseEntity.ok(adminService.getVendors());
    }

    @GetMapping("/clients")
    public ResponseEntity<List<com.dibladi.dibladibackend.dto.response.ClientSummaryResponse>> getClients() {
        return ResponseEntity.ok(adminService.getClients());
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getOrders() {
        return ResponseEntity.ok(adminService.getOrders());
    }

    @GetMapping("/deliveries")
    public ResponseEntity<List<DeliveryResponse>> getDeliveries() {
        return ResponseEntity.ok(adminService.getDeliveries());
    }

    @PutMapping("/deliveries/{id}/status")
    public ResponseEntity<?> updateDeliveryStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        try {
            String statusValue = body.get("status");
            DeliveryStatus status = DeliveryStatus.valueOf(statusValue);
            return ResponseEntity.ok(adminService.updateDeliveryStatus(id, status));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories().stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList()));
    }

    @GetMapping("/parent-categories")
    public ResponseEntity<List<ParentCategoryResponse>> getParentCategories() {
        return ResponseEntity.ok(parentCategoryService.getAllForAdmin());
    }

    @PutMapping("/parent-categories/{id}")
    public ResponseEntity<?> updateParentCategory(
            @PathVariable("id") Long id,
            @Valid @RequestBody CategoryRequest request) {
        try {
            return ResponseEntity.ok(parentCategoryService.update(id, request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/clients/{id}")
    public ResponseEntity<?> getClientById(@PathVariable("id") Long id) {
        try {
            var client = adminService.getClientById(id);
            return ResponseEntity.ok(client);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable("id") Long id) {
        try {
            var order = adminService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/orders/search")
    public ResponseEntity<?> getOrderByNumber(@RequestParam("orderNumber") String orderNumber) {
        try {
            var order = adminService.getOrderByOrderNumber(orderNumber);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryRequest request) {
        try {
            CategoryResponse category = CategoryResponse.from(categoryService.createCategory(request));
            return ResponseEntity.ok(category);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable("id") Long id,
            @Valid @RequestBody CategoryRequest request) {
        try {
            CategoryResponse category = CategoryResponse.from(categoryService.updateCategory(id, request));
            return ResponseEntity.ok(category);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable("id") Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(Map.of("message", "Catégorie supprimée avec succès."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/requests")
    public ResponseEntity<Page<VendorRequest>> getVendorRequests(
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminService.getVendorRequests(pageable));
    }

    /**
     * Approuve une demande vendeur : crée User + Vendor, envoie email avec identifiants.
     */
    @PostMapping("/requests/{id}/approve")
    public ResponseEntity<Map<String, String>> approveVendorRequest(@PathVariable("id") Long id) {
        try {
            Map<String, String> result = adminService.approveVendorRequest(id);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(409).body(Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Rejette une demande vendeur : met status REJECTED, envoie email de refus.
     */
    @PostMapping("/requests/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectVendorRequest(@PathVariable("id") Long id) {
        try {
            Map<String, String> result = adminService.rejectVendorRequest(id);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(409).body(Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Met à jour le score d'un vendeur (0–100). Réservé aux admins.
     */
    @PutMapping("/vendors/{id}/score")
    public ResponseEntity<Map<String, String>> updateVendorScore(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Integer> body) {
        try {
            Integer score = body.get("score");
            Map<String, String> result = adminService.updateVendorScore(id, score);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}