package com.dibladi.dibladibackend.controller;

import com.dibladi.dibladibackend.dto.VendorProfileUpdateRequest;
import com.dibladi.dibladibackend.entity.User;
import com.dibladi.dibladibackend.entity.Vendor;
import com.dibladi.dibladibackend.repository.UserRepository;
import com.dibladi.dibladibackend.repository.VendorRepository;
import com.dibladi.dibladibackend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

        private final UserRepository userRepository;
        private final VendorRepository vendorRepository;
        private final ReviewRepository reviewRepository;

    private Map<String, Object> buildProfileMap(Vendor vendor, User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", vendor.getId());
        map.put("firstName", vendor.getFirstName());
        map.put("lastName", vendor.getLastName());
        map.put("email", user.getEmail());
        map.put("phone", vendor.getPhone());
        map.put("shopName", vendor.getShopName());
        map.put("city", vendor.getCity());
        map.put("shopAddress", vendor.getShopAddress());
        map.put("socialLink", vendor.getSocialLink());
        map.put("score", vendor.getScore());
        // sellerRating: average of all reviews for products of this vendor
        var reviews = reviewRepository.findByProductVendorIdOrderByCreatedAtDesc(vendor.getId());
        double avg = reviews.stream().mapToInt(r -> r.getRating() == null ? 0 : r.getRating()).average().orElse(0.0);
        map.put("sellerRating", avg);
        map.put("photoUrl", vendor.getPhotoUrl());
        map.put("isApproved", vendor.getIsApproved());
        map.put("createdAt", vendor.getCreatedAt());
        map.put("bankAccountHolderName", vendor.getBankAccountHolderName());
        map.put("bankName", vendor.getBankName());
        map.put("bankRib", vendor.getBankRib());
        return map;
    }

    @GetMapping({"/profile", "/me"})
    public ResponseEntity<?> getVendorProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found for email: " + email));

        return ResponseEntity.ok(buildProfileMap(vendor, user));
    }

    @PutMapping({"/profile", "/me"})
    public ResponseEntity<?> updateVendorProfile(
            @RequestBody VendorProfileUpdateRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found for email: " + email));

        if (request.getFirstName() != null) vendor.setFirstName(request.getFirstName());
        if (request.getLastName() != null) vendor.setLastName(request.getLastName());
        if (request.getPhone() != null) vendor.setPhone(request.getPhone());
        if (request.getShopName() != null) vendor.setShopName(request.getShopName());
        if (request.getCity() != null) vendor.setCity(request.getCity());
        if (request.getShopAddress() != null) vendor.setShopAddress(request.getShopAddress());
        if (request.getSocialLink() != null) vendor.setSocialLink(request.getSocialLink());
        if (request.getPhotoUrl() != null) vendor.setPhotoUrl(request.getPhotoUrl());
        if (request.getBankAccountHolderName() != null) vendor.setBankAccountHolderName(request.getBankAccountHolderName());
        if (request.getBankName() != null) vendor.setBankName(request.getBankName());
        if (request.getBankRib() != null) vendor.setBankRib(request.getBankRib());

        vendorRepository.save(vendor);

        return ResponseEntity.ok(buildProfileMap(vendor, user));
    }
}
