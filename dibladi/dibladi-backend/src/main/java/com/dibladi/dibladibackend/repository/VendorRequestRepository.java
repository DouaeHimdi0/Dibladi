package com.dibladi.dibladibackend.repository;

import com.dibladi.dibladibackend.entity.VendorRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorRequestRepository extends JpaRepository<VendorRequest, Long> {

    /** Vérifie si une demande existe déjà pour cet email (évite les doublons) */
    boolean existsByEmail(String email);
}
