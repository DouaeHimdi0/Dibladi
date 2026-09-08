package com.dibladi.dibladibackend.entity;

import com.dibladi.dibladibackend.enums.VendorRequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "vendor_requests")
public class VendorRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 255)
    private String password;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String shopName;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String shopAddress;

    // Lien "autre réseau social" générique (Facebook, TikTok, site web, etc.)
    private String socialLink;

    // Lien Instagram spécifique
    private String instagramLink;

    // URL de la photo uploadée lors de l'inscription (stockée localement en dev)
    @Column(length = 500)
    private String photoUrl;

    @Column(name = "bank_account_holder_name")
    private String bankAccountHolderName;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "bank_rib", length = 24)
    private String bankRib;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VendorRequestStatus status = VendorRequestStatus.PENDING;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime processedAt;
}
