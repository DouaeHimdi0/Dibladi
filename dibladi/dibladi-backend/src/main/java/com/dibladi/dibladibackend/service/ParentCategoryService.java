package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.dto.response.CategoryAttributeResponse;
import com.dibladi.dibladibackend.dto.response.ParentCategoryResponse;
import com.dibladi.dibladibackend.dto.request.CategoryRequest;

import java.util.List;

public interface ParentCategoryService {
    List<ParentCategoryResponse> getAllWithSubcategories();
    ParentCategoryResponse getById(Long id);
    ParentCategoryResponse getBySlug(String slug);
    List<ParentCategoryResponse> getAllForAdmin();
    ParentCategoryResponse update(Long id, CategoryRequest request);
    List<CategoryAttributeResponse> getAttributesBySubcategory(Long subcategoryId);
}
