package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.dto.ReviewCreateRequest;
import com.dibladi.dibladibackend.dto.ReviewResponse;
import com.dibladi.dibladibackend.entity.Client;
import com.dibladi.dibladibackend.entity.Product;
import com.dibladi.dibladibackend.entity.Review;
import com.dibladi.dibladibackend.entity.User;
import com.dibladi.dibladibackend.entity.Vendor;
import com.dibladi.dibladibackend.repository.ClientRepository;
import com.dibladi.dibladibackend.repository.ProductRepository;
import com.dibladi.dibladibackend.repository.ReviewRepository;
import com.dibladi.dibladibackend.repository.UserRepository;
import com.dibladi.dibladibackend.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final VendorRepository vendorRepository;

    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(ReviewResponse::from)
                .toList();
    }

    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        if (productId == null) {
            return List.of();
        }

        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional
    public ReviewResponse createReview(ReviewCreateRequest request, String clientEmail) {
        if (clientEmail == null || clientEmail.isBlank()) {
            throw new IllegalArgumentException("Authentification requise pour laisser un avis.");
        }

        User user = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        Client client = clientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profil client introuvable pour cet utilisateur."));

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new IllegalArgumentException("Produit introuvable."));

        boolean alreadyReviewed = reviewRepository.existsByClientIdAndProductId(client.getId(), product.getId());
        if (alreadyReviewed) {
            throw new IllegalArgumentException("Vous avez déjà laissé un avis pour ce produit.");
        }

        Review review = Review.builder()
                .product(product)
                .client(client)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        Review saved = reviewRepository.save(review);
        return ReviewResponse.from(saved);
    }

    public List<ReviewResponse> getReviewsByVendor(String vendorEmail) {
        if (vendorEmail == null || vendorEmail.isBlank()) {
            throw new IllegalArgumentException("Authentification requise pour consulter les avis.");
        }

        User user = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        Vendor vendor = vendorRepository.findAll().stream()
                .filter(v -> v.getUser() != null && Objects.equals(v.getUser().getId(), user.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Profil vendeur introuvable pour cet utilisateur."));

        return reviewRepository.findByProductVendorIdOrderByCreatedAtDesc(vendor.getId()).stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Transactional
    public ReviewResponse replyToReview(Long reviewId, String reply, String vendorEmail) {
        if (vendorEmail == null || vendorEmail.isBlank()) {
            throw new IllegalArgumentException("Authentification requise pour répondre à un avis.");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Avis introuvable."));

        if (review.getProduct() == null || review.getProduct().getVendor() == null || review.getProduct().getVendor().getUser() == null) {
            throw new IllegalArgumentException("Produit ou vendeur introuvable pour cet avis.");
        }

        if (!review.getProduct().getVendor().getUser().getEmail().equals(vendorEmail)) {
            throw new IllegalArgumentException("Vous ne pouvez répondre qu'aux avis concernant vos propres produits. (Email attendu: " + vendorEmail + ", Email actuel: " + review.getProduct().getVendor().getUser().getEmail() + ")");
        }

        if (reply == null || reply.trim().isEmpty()) {
            throw new IllegalArgumentException("La réponse ne peut pas être vide.");
        }

        review.setVendorReply(reply.trim());
        Review saved = reviewRepository.save(review);
        return ReviewResponse.from(saved);
    }

    @Transactional
    public void deleteReview(Long reviewId, String vendorEmail) {
        if (vendorEmail == null || vendorEmail.isBlank()) {
            throw new IllegalArgumentException("Authentification requise pour supprimer un avis.");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Avis introuvable."));

        if (review.getProduct() == null || review.getProduct().getVendor() == null || review.getProduct().getVendor().getUser() == null) {
            throw new IllegalArgumentException("Produit ou vendeur introuvable pour cet avis.");
        }

        if (!review.getProduct().getVendor().getUser().getEmail().equals(vendorEmail)) {
            throw new IllegalArgumentException("Vous ne pouvez supprimer que les avis concernant vos propres produits. (Email attendu: " + vendorEmail + ", Email actuel: " + review.getProduct().getVendor().getUser().getEmail() + ")");
        }

        reviewRepository.delete(review);
    }
}
