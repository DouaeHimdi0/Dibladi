package com.dibladi.dibladibackend.repository;

import com.dibladi.dibladibackend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Review> findByProductVendorIdOrderByCreatedAtDesc(Long vendorId);
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Optional<Double> findAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.vendor.id = :vendorId")
    Optional<Double> findAverageRatingByProductVendorId(@Param("vendorId") Long vendorId);
    long countByProductId(Long productId);
    boolean existsByClientIdAndProductId(Long clientId, Long productId);
}
