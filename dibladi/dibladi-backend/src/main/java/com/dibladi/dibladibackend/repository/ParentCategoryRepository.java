package com.dibladi.dibladibackend.repository;

import com.dibladi.dibladibackend.entity.ParentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentCategoryRepository extends JpaRepository<ParentCategory, Long> {
    List<ParentCategory> findByIsActiveTrueOrderByDisplayOrderAsc();
    Optional<ParentCategory> findBySlug(String slug);
}
