package com.dibladi.dibladibackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "brands")
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "font_style", nullable = false)
    private String fontStyle = "sans-bold";

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
