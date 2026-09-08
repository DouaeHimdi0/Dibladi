package com.dibladi.dibladibackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String shopName;
    private String city;
    private String shopAddress;
    private String socialLink;
    private String instagramLink;
    private String photoUrl;
    private String bankAccountHolderName;
    private String bankName;
    @jakarta.validation.constraints.Pattern(regexp = "^\\d{24}$", message = "Le RIB doit contenir exactement 24 chiffres")
    private String bankRib;
}
