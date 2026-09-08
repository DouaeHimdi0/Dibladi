package com.dibladi.dibladibackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "vendors")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

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

    // Lien Instagram spécifique (copié depuis la VendorRequest lors de l'approbation)
    private String instagramLink;

    // URL de la photo (copiée depuis la VendorRequest lors de l'approbation)
    @Column(length = 500)
    private String photoUrl;

    @Column(name = "bank_account_holder_name")
    private String bankAccountHolderName;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "bank_rib", length = 24)
    private String bankRib;

    @Column(nullable = false)
    private Integer score = 0;

    @Column(nullable = false)
    private Boolean isApproved = false;

    private LocalDateTime approvedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
