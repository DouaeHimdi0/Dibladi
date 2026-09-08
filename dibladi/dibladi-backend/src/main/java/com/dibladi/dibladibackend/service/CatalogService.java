package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.dto.CategoryResponse;
import com.dibladi.dibladibackend.dto.ProductResponse;
import com.dibladi.dibladibackend.entity.Product;
import com.dibladi.dibladibackend.entity.Vendor;
import com.dibladi.dibladibackend.repository.CategoryRepository;
import com.dibladi.dibladibackend.repository.ProductRepository;
import com.dibladi.dibladibackend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProducts(String category, String categorySlug, Long categoryId, String parentCategorySlug, Long parentCategoryId, String search, String brand, Double minRating,
                                             BigDecimal minPrice, BigDecimal maxPrice, Boolean inStockOnly,
                                             Boolean onSale) {
        List<Product> products;
        if (parentCategorySlug != null && !parentCategorySlug.isBlank()) {
            products = productRepository.findByParentCategorySlugAndIsActiveTrue(parentCategorySlug);
        } else if (parentCategoryId != null) {
            products = productRepository.findByParentCategoryIdAndIsActiveTrue(parentCategoryId);
        } else if (categorySlug != null && !categorySlug.isBlank()) {
            products = productRepository.findByCategorySlugAndIsActiveTrue(categorySlug);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryIdAndIsActiveTrue(categoryId);
        } else {
            products = productRepository.findAll();
        }

        return products.stream()
                .filter(product -> category == null || category.isBlank() || category.equalsIgnoreCase(product.getCategory() != null ? product.getCategory().getSlug() : null))
                .filter(product -> search == null || search.isBlank() || (product.getName() != null && product.getName().toLowerCase().contains(search.toLowerCase())))
                .filter(product -> matchesBrand(product, brand))
                .filter(product -> minRating == null || product.getAverageRating() >= minRating)
                .filter(product -> minPrice == null || product.getPrice().compareTo(minPrice) >= 0)
                .filter(product -> maxPrice == null || product.getPrice().compareTo(maxPrice) <= 0)
                .filter(product -> inStockOnly == null || !inStockOnly || product.getStockQuantity() > 0)
                .filter(product -> onSale == null || !onSale || isOnSale(product))
                .map(product -> {
                    double averageRating = reviewRepository.findAverageRatingByProductId(product.getId()).orElse(0.0);
                    int reviewsCount = (int) reviewRepository.countByProductId(product.getId());
                    double sellerRating = product.getVendor() == null
                            ? 0.0
                            : reviewRepository.findAverageRatingByProductVendorId(product.getVendor().getId()).orElse(0.0);
                    return ProductResponse.from(product, List.of(), averageRating, reviewsCount, sellerRating);
                })
                .collect(Collectors.toList());
    }

    public ProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        return ProductResponse.from(product);
    }

    private boolean isOnSale(Product product) {
        if (product == null || product.getPrice() == null || product.getOldPrice() == null) {
            return false;
        }
        return product.getOldPrice().compareTo(product.getPrice()) > 0;
    }

    private boolean matchesBrand(Product product, String brand) {
        if (brand == null || brand.isBlank()) {
            return true;
        }

        String normalized = brand.trim().toLowerCase();

        Vendor vendor = product.getVendor();
        if (vendor != null && vendor.getShopName() != null) {
            String shopName = vendor.getShopName().toLowerCase();
            if (shopName.equals(normalized) || shopName.replace(" ", "-").equals(normalized)) {
                return true;
            }
        }

        return false;
    }
}
