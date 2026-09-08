package com.dibladi.dibladibackend.controller;

import com.dibladi.dibladibackend.dto.response.ParentCategoryResponse;
import com.dibladi.dibladibackend.dto.response.SubcategoryResponse;
import com.dibladi.dibladibackend.service.ParentCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parent-categories")
@RequiredArgsConstructor
public class ParentCategoryController {
    private final ParentCategoryService parentCategoryService;

    @GetMapping
    public ResponseEntity<List<ParentCategoryResponse>> getAll() {
        return ResponseEntity.ok(parentCategoryService.getAllWithSubcategories());
    }

    @GetMapping("/{id}/subcategories")
    public ResponseEntity<List<SubcategoryResponse>> getSubcategories(@PathVariable("id") Long id) {
        return ResponseEntity.ok(parentCategoryService.getById(id).getSubcategories());
    }

    @GetMapping("/{slug}/categories")
    public ResponseEntity<List<SubcategoryResponse>> getCategories(@PathVariable("slug") String slug) {
        return ResponseEntity.ok(parentCategoryService.getBySlug(slug).getSubcategories());
    }
}
