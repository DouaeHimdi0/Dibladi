package com.dibladi.dibladibackend.dto;

import com.dibladi.dibladibackend.entity.Product;
import com.dibladi.dibladibackend.entity.Category;
import com.dibladi.dibladibackend.entity.Vendor;
import com.dibladi.dibladibackend.dto.response.ProductVariantResponse;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        BigDecimal oldPrice,
        Integer stockQuantity,
        List<String> images,
        BigDecimal deliveryFee,
        Long categoryId,
        String category,
        Long vendorId,
        String sellerName,
        String sellerShopName,
        Boolean isActive,
        Double averageRating,
        Integer reviewsCount,
        Long subcategoryId,
        String subcategoryName,
        String subcategorySlug,
        Long parentCategoryId,
        String parentCategoryName,
        List<ProductVariantResponse> variants,
        Boolean hasVariants,
        Double sellerRating
) {
    public static ProductResponse from(Product product) {
        return from(product, List.of());
    }

    public static ProductResponse from(Product product, List<ProductVariantResponse> variants) {
        return from(product, variants, product.getAverageRating(), product.getReviewsCount(), 0.0);
    }

    public static ProductResponse from(Product product, List<ProductVariantResponse> variants,
                                       Double averageRating, Integer reviewsCount, Double sellerRating) {
        Category category = product.getCategory();
        Vendor vendor = product.getVendor();
        var parentCategory = category != null ? category.getParentCategory() : null;

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getOldPrice(),
                product.getStockQuantity(),
                product.getImages(),
                product.getDeliveryFee(),
                category != null ? category.getId() : null,
                category != null ? category.getSlug() : null,
                vendor != null ? vendor.getId() : null,
                vendor != null ? vendor.getFirstName() + " " + vendor.getLastName() : null,
                vendor != null ? vendor.getShopName() : null,
                product.getIsActive(),
                averageRating != null ? averageRating : 0.0,
                reviewsCount != null ? reviewsCount : 0,
                category != null ? category.getId() : null,
                category != null ? category.getName() : null,
                category != null ? category.getSlug() : null,
                parentCategory != null ? parentCategory.getId() : null,
                parentCategory != null ? parentCategory.getName() : null,
                variants != null ? variants : List.of(),
                variants != null && !variants.isEmpty(),
                sellerRating != null ? sellerRating : 0.0
        );
    }
}
