package com.dibladi.dibladibackend.repository;

import com.dibladi.dibladibackend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductIdOrderByIdAsc(Long productId);
    List<ProductVariant> findByProductIdAndIsAvailableTrue(Long productId);
    void deleteByProductId(Long productId);
}
