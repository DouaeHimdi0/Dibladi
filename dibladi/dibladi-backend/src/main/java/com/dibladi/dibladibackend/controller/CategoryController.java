package com.dibladi.dibladibackend.controller;

import com.dibladi.dibladibackend.entity.Category;
import com.dibladi.dibladibackend.dto.response.CategoryAttributeResponse;
import com.dibladi.dibladibackend.service.CategoryService;
import com.dibladi.dibladibackend.service.ParentCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final ParentCategoryService parentCategoryService;

    @GetMapping("/all")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}/attributes")
    public ResponseEntity<List<CategoryAttributeResponse>> getAttributes(@PathVariable("id") Long id) {
        return ResponseEntity.ok(parentCategoryService.getAttributesBySubcategory(id));
    }
}
