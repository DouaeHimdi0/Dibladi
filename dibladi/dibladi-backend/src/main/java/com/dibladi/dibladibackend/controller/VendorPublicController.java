package com.dibladi.dibladibackend.controller;

import com.dibladi.dibladibackend.dto.PublicVendorResponse;
import com.dibladi.dibladibackend.entity.Vendor;
import com.dibladi.dibladibackend.repository.VendorRepository;
import com.dibladi.dibladibackend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorPublicController {

    private final VendorRepository vendorRepository;
    private final ReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<List<PublicVendorResponse>> getApprovedVendors() {
        List<PublicVendorResponse> vendors = vendorRepository.findAll().stream()
                .filter(Vendor::getIsApproved)
                .map(v -> {
                    var reviews = reviewRepository.findByProductVendorIdOrderByCreatedAtDesc(v.getId());
                    double avg = reviews.stream().mapToInt(r -> r.getRating() == null ? 0 : r.getRating()).average().orElse(0.0);
                        return new PublicVendorResponse(v.getId(), v.getFirstName() + " " + v.getLastName(), v.getShopName(),
                            v.getPhone(), v.getCity(), v.getShopAddress(), v.getPhotoUrl(), v.getIsApproved(), avg);
                })
                .toList();

        return ResponseEntity.ok(vendors);
    }
}
