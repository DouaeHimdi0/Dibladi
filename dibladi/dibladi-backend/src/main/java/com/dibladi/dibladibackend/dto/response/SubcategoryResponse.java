package com.dibladi.dibladibackend.dto.response;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubcategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String imageUrl;
    private Boolean isActive;
    private Integer displayOrder;
    private List<CategoryAttributeResponse> attributes;
}
