package com.dibladi.dibladibackend.dto;

import com.dibladi.dibladibackend.entity.Brand;

public record BrandResponse(
        Long id,
        String name,
        String slug,
        String fontStyle,
        Boolean isActive
) {
    public static BrandResponse from(Brand brand) {
        return new BrandResponse(
                brand.getId(),
                brand.getName(),
                brand.getSlug(),
                brand.getFontStyle(),
                brand.getIsActive()
        );
    }
}
