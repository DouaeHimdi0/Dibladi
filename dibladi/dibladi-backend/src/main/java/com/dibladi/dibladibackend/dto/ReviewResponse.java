package com.dibladi.dibladibackend.dto;

import com.dibladi.dibladibackend.entity.Client;
import com.dibladi.dibladibackend.entity.Review;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long productId,
        String clientName,
        Integer rating,
        String comment,
        String vendorReply,
        LocalDateTime createdAt
) {
    public static ReviewResponse from(Review review) {
        String clientName = null;

        if (review.getClient() != null) {
            Client client = review.getClient();
            String firstName = client.getFirstName() != null ? client.getFirstName().trim() : "";
            String lastName = client.getLastName() != null ? client.getLastName().trim() : "";
            clientName = (firstName + " " + lastName).trim();
        }

        return new ReviewResponse(
                review.getId(),
                review.getProduct() != null ? review.getProduct().getId() : null,
                clientName,
                review.getRating(),
                review.getComment(),
                review.getVendorReply(),
                review.getCreatedAt()
        );
    }
}
