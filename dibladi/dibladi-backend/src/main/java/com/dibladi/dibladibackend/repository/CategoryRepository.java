package com.dibladi.dibladibackend.repository;

import com.dibladi.dibladibackend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    java.util.List<Category> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    java.util.List<Category> findByParentCategoryIdAndIsActiveTrueOrderByDisplayOrderAsc(Long parentCategoryId);
    boolean existsByName(String name);
    boolean existsBySlug(String slug);
    boolean existsByNameAndIdNot(String name, Long id);
    boolean existsBySlugAndIdNot(String slug, Long id);
}
