package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.dto.request.CategoryRequest;
import com.dibladi.dibladibackend.entity.Category;
import com.dibladi.dibladibackend.repository.CategoryRepository;
import com.dibladi.dibladibackend.repository.ParentCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ParentCategoryRepository parentCategoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category createCategory(CategoryRequest request) {
        String name = Optional.ofNullable(request.getName()).map(String::trim).orElse("");
        if (name.isBlank()) {
            throw new IllegalArgumentException("Le nom de la catégorie est requis.");
        }

        String slug = toSlug(name);
        if (categoryRepository.existsByName(name)) {
            throw new IllegalArgumentException("Une catégorie avec ce nom existe déjà.");
        }
        if (categoryRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Une catégorie avec ce slug existe déjà.");
        }

        Category category = Category.builder()
                .name(name)
                .slug(slug)
                .imageUrl(emptyToNull(request.getImageUrl()))
                .isActive(request.getIsActive() == null ? true : request.getIsActive())
                .parentCategory(resolveParent(request.getParentCategoryId()))
                .build();

        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Catégorie introuvable avec l'id : " + id));

        String name = Optional.ofNullable(request.getName()).map(String::trim).orElse("");
        if (name.isBlank()) {
            throw new IllegalArgumentException("Le nom de la catégorie est requis.");
        }

        String slug = toSlug(name);
        if (!category.getName().equalsIgnoreCase(name) && categoryRepository.existsByNameAndIdNot(name, id)) {
            throw new IllegalArgumentException("Une autre catégorie avec ce nom existe déjà.");
        }
        if (!category.getSlug().equals(slug) && categoryRepository.existsBySlugAndIdNot(slug, id)) {
            throw new IllegalArgumentException("Une autre catégorie avec ce slug existe déjà.");
        }

        category.setName(name);
        category.setSlug(slug);
        if (request.getImageUrl() != null) {
            category.setImageUrl(emptyToNull(request.getImageUrl()));
        }
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }
        category.setParentCategory(resolveParent(request.getParentCategoryId()));

        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Catégorie introuvable avec l'id : " + id);
        }
        categoryRepository.deleteById(id);
    }

    private String emptyToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private com.dibladi.dibladibackend.entity.ParentCategory resolveParent(Long parentCategoryId) {
        if (parentCategoryId == null) {
            return null;
        }
        return parentCategoryRepository.findById(parentCategoryId)
                .orElseThrow(() -> new IllegalArgumentException("Grande catégorie parente introuvable."));
    }

    private String toSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        return normalized.isBlank() ? "category-" + System.currentTimeMillis() : normalized;
    }
}
