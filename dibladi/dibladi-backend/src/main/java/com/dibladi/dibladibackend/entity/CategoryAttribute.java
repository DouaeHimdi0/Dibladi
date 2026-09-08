package com.dibladi.dibladibackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "category_attributes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryAttribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "attribute_key", nullable = false, length = 100)
    private String attributeKey;

    @Column(name = "attribute_label", nullable = false, length = 200)
    private String attributeLabel;

    @Column(name = "attribute_type", nullable = false, columnDefinition = "ENUM('text', 'select', 'number')")
    @Builder.Default
    private String attributeType = "text";

    @Column(name = "placeholder_hint", length = 300)
    private String placeholderHint;

    @Column(name = "is_required", nullable = false)
    @Builder.Default
    private Boolean isRequired = false;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
}
