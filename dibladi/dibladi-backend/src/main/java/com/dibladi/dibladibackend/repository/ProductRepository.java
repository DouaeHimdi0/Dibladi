package com.dibladi.dibladibackend.repository;

import com.dibladi.dibladibackend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    long countByIsActiveTrue();

    java.util.List<Product> findByCategorySlugAndIsActiveTrue(String slug);

    java.util.List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.category.parentCategory.slug = :slug")
    List<Product> findByParentCategorySlugAndIsActiveTrue(@Param("slug") String slug);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.category.parentCategory.id = :parentCategoryId")
    List<Product> findByParentCategoryIdAndIsActiveTrue(@Param("parentCategoryId") Long parentCategoryId);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);
}

