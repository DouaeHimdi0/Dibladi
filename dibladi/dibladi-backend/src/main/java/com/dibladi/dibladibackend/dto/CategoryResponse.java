package com.dibladi.dibladibackend.dto;

import com.dibladi.dibladibackend.entity.Category;

public record CategoryResponse(Long id, String name, String slug, Boolean isActive, String imageUrl, Long parentCategoryId, String parentCategoryName) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getIsActive(),
                category.getImageUrl(),
                category.getParentCategory() != null ? category.getParentCategory().getId() : null,
                category.getParentCategory() != null ? category.getParentCategory().getName() : null
        );
    }
}
