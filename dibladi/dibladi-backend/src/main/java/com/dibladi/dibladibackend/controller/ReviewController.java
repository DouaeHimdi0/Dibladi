package com.dibladi.dibladibackend.controller;

import com.dibladi.dibladibackend.dto.ReviewCreateRequest;
import com.dibladi.dibladibackend.dto.ReviewResponse;
import com.dibladi.dibladibackend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getReviews(@RequestParam(required = false) Long productId) {
        if (productId != null) {
            return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
        }

        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody ReviewCreateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication != null ? authentication.getName() : null;

        ReviewResponse response = reviewService.createReview(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/vendor")
    public ResponseEntity<List<ReviewResponse>> getVendorReviews() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication != null ? authentication.getName() : null;

        return ResponseEntity.ok(reviewService.getReviewsByVendor(email));
    }

    @PutMapping("/{id}/reply")
    public ResponseEntity<ReviewResponse> replyToReview(@PathVariable("id") Long id, @RequestBody java.util.Map<String, String> payload) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication != null ? authentication.getName() : null;

        String reply = payload.get("reply");
        ReviewResponse response = reviewService.replyToReview(id, reply, email);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable("id") Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication != null ? authentication.getName() : null;

        reviewService.deleteReview(id, email);
        return ResponseEntity.noContent().build();
    }
}
