package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.dto.response.CategoryAttributeResponse;
import com.dibladi.dibladibackend.dto.response.ParentCategoryResponse;
import com.dibladi.dibladibackend.dto.response.SubcategoryResponse;
import com.dibladi.dibladibackend.dto.request.CategoryRequest;
import com.dibladi.dibladibackend.entity.Category;
import com.dibladi.dibladibackend.entity.ParentCategory;
import com.dibladi.dibladibackend.repository.CategoryAttributeRepository;
import com.dibladi.dibladibackend.repository.CategoryRepository;
import com.dibladi.dibladibackend.repository.ParentCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParentCategoryServiceImpl implements ParentCategoryService {
    private final ParentCategoryRepository parentCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeRepository categoryAttributeRepository;

    @Override
    public List<ParentCategoryResponse> getAllWithSubcategories() {
        return parentCategoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ParentCategoryResponse getById(Long id) {
        ParentCategory parent = parentCategoryRepository.findById(id)
                .filter(value -> Boolean.TRUE.equals(value.getIsActive()))
                .orElseThrow(() -> new IllegalArgumentException("Grande catégorie introuvable."));
        return toResponse(parent);
    }

    @Override
    public ParentCategoryResponse getBySlug(String slug) {
        ParentCategory parent = parentCategoryRepository.findBySlug(slug)
                .filter(value -> Boolean.TRUE.equals(value.getIsActive()))
                .orElseThrow(() -> new IllegalArgumentException("Grande catégorie introuvable."));
        return toResponse(parent);
    }

    @Override
    public List<ParentCategoryResponse> getAllForAdmin() {
        return parentCategoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public ParentCategoryResponse update(Long id, CategoryRequest request) {
        ParentCategory parent = parentCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Grande catégorie introuvable."));
        String name = request.getName() == null ? "" : request.getName().trim();
        if (name.isBlank()) {
            throw new IllegalArgumentException("Le nom de la grande catégorie est requis.");
        }
        parent.setName(name);
        if (request.getImageUrl() != null) {
            parent.setImageUrl(request.getImageUrl().trim().isEmpty() ? null : request.getImageUrl().trim());
        }
        if (request.getIsActive() != null) {
            parent.setIsActive(request.getIsActive());
        }
        return toResponse(parentCategoryRepository.save(parent));
    }

    @Override
    public List<CategoryAttributeResponse> getAttributesBySubcategory(Long subcategoryId) {
        if (!categoryRepository.existsById(subcategoryId)) {
            throw new IllegalArgumentException("Sous-catégorie introuvable.");
        }
        return categoryAttributeRepository.findByCategoryIdOrderByDisplayOrderAsc(subcategoryId).stream()
                .map(CategoryAttributeResponse::from)
                .toList();
    }

    private ParentCategoryResponse toResponse(ParentCategory parent) {
        List<SubcategoryResponse> subcategories = categoryRepository
                .findByParentCategoryIdAndIsActiveTrueOrderByDisplayOrderAsc(parent.getId()).stream()
                .map(this::toSubcategoryResponse)
                .toList();

        return ParentCategoryResponse.builder()
                .id(parent.getId())
                .name(parent.getName())
                .slug(parent.getSlug())
                .imageUrl(parent.getImageUrl())
                .isActive(parent.getIsActive())
                .displayOrder(parent.getDisplayOrder())
                .subcategories(subcategories)
                .build();
    }

    private SubcategoryResponse toSubcategoryResponse(Category category) {
        return SubcategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .imageUrl(category.getImageUrl())
                .isActive(category.getIsActive())
                .displayOrder(category.getDisplayOrder())
                .attributes(categoryAttributeRepository.findByCategoryIdOrderByDisplayOrderAsc(category.getId()).stream()
                        .map(CategoryAttributeResponse::from)
                        .toList())
                .build();
    }
}
