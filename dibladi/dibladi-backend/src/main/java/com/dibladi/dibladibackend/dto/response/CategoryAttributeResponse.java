package com.dibladi.dibladibackend.dto.response;

import com.dibladi.dibladibackend.entity.CategoryAttribute;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryAttributeResponse {
    private Long id;
    private String attributeKey;
    private String attributeLabel;
    private String attributeType;
    private String placeholderHint;
    private Boolean isRequired;
    private Integer displayOrder;

    public static CategoryAttributeResponse from(CategoryAttribute attribute) {
        return CategoryAttributeResponse.builder()
                .id(attribute.getId())
                .attributeKey(attribute.getAttributeKey())
                .attributeLabel(attribute.getAttributeLabel())
                .attributeType(attribute.getAttributeType())
                .placeholderHint(attribute.getPlaceholderHint())
                .isRequired(attribute.getIsRequired())
                .displayOrder(attribute.getDisplayOrder())
                .build();
    }
}
