package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.dto.ProductCreateRequest;
import com.dibladi.dibladibackend.dto.ProductResponse;
import com.dibladi.dibladibackend.dto.ProductUpdateRequest;
import com.dibladi.dibladibackend.dto.response.ProductVariantResponse;
import com.dibladi.dibladibackend.entity.ProductVariant;
import com.dibladi.dibladibackend.entity.Category;
import com.dibladi.dibladibackend.entity.Product;
import com.dibladi.dibladibackend.entity.User;
import com.dibladi.dibladibackend.entity.Vendor;
import com.dibladi.dibladibackend.repository.CategoryRepository;
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
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
        private final ProductVariantService productVariantService;
        private final ReviewRepository reviewRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produit introuvable."));

        return toProductResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request, String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Authentification requise pour créer un produit.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        Vendor vendor = vendorRepository.findAll().stream()
                .filter(v -> v.getUser() != null && Objects.equals(v.getUser().getId(), user.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Profil vendeur introuvable pour cet utilisateur."));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Catégorie introuvable."));

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .oldPrice(request.price())
                .stockQuantity(request.stockQuantity())
                .images(request.images() == null ? List.of() : request.images())
                .vendor(vendor)
                .category(category)
                .isActive(true)
                .averageRating(0.0)
                .reviewsCount(0)
                .build();

                Product saved = productRepository.save(product);
                if (request.variants() != null) {
                        request.variants().forEach(variant -> productVariantService.createVariant(saved, variant));
                }
                return toProductResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request, String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Authentification requise pour modifier un produit.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        Vendor vendor = vendorRepository.findAll().stream()
                .filter(v -> v.getUser() != null && Objects.equals(v.getUser().getId(), user.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Profil vendeur introuvable pour cet utilisateur."));

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produit introuvable."));

        if (product.getVendor() == null || !Objects.equals(product.getVendor().getId(), vendor.getId())) {
            throw new AccessDeniedException("Vous n'êtes pas autorisé à modifier ce produit.");
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Catégorie introuvable."));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setOldPrice(request.price());
        product.setStockQuantity(request.stockQuantity());
        product.setImages(request.images() == null ? List.of() : request.images());
        product.setCategory(category);
        product.setIsActive(request.stockQuantity() > 0);

        Product updated = productRepository.save(product);
        return toProductResponse(updated);
    }

    @Transactional
    public void deleteProduct(Long id, String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Authentification requise pour supprimer un produit.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        Vendor vendor = vendorRepository.findAll().stream()
                .filter(v -> v.getUser() != null && Objects.equals(v.getUser().getId(), user.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Profil vendeur introuvable pour cet utilisateur."));

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produit introuvable."));

        if (product.getVendor() == null || !Objects.equals(product.getVendor().getId(), vendor.getId())) {
            throw new AccessDeniedException("Vous n'êtes pas autorisé à supprimer ce produit.");
        }

        productRepository.delete(product);
    }

    public List<ProductResponse> getProductsByVendorEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Authentification requise pour lister les produits.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));

        Vendor vendor = vendorRepository.findAll().stream()
                .filter(v -> v.getUser() != null && Objects.equals(v.getUser().getId(), user.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Profil vendeur introuvable pour cet utilisateur."));

        return productRepository.findAll().stream()
                .filter(product -> product.getVendor() != null && Objects.equals(product.getVendor().getId(), vendor.getId()))
                                .map(this::toProductResponse)
                .toList();
    }

        private ProductResponse toProductResponse(Product product) {
                List<ProductVariantResponse> variants = productVariantService.getVariantsByProduct(product.getId());
                double averageRating = reviewRepository.findAverageRatingByProductId(product.getId()).orElse(0.0);
                int reviewsCount = (int) reviewRepository.countByProductId(product.getId());
                double sellerRating = product.getVendor() == null
                        ? 0.0
                        : reviewRepository.findAverageRatingByProductVendorId(product.getVendor().getId()).orElse(0.0);
                return ProductResponse.from(product, variants, averageRating, reviewsCount, sellerRating);
        }
}
