package com.dibladi.dibladibackend.repository;

import com.dibladi.dibladibackend.entity.CategoryAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryAttributeRepository extends JpaRepository<CategoryAttribute, Long> {
    List<CategoryAttribute> findByCategoryIdOrderByDisplayOrderAsc(Long categoryId);
}
