package com.dibladi.dibladibackend.repository;

import com.dibladi.dibladibackend.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    java.util.List<Vendor> findByShopNameContainingIgnoreCaseAndIsApprovedTrue(String shopName);
    Optional<Vendor> findByUserId(Long userId);
}
