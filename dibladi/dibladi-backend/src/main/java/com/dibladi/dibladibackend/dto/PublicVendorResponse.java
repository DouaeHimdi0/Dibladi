package com.dibladi.dibladibackend.dto;

public record PublicVendorResponse(
        Long id,
        String fullName,
        String shopName,
        String phone,
        String city,
        String address,
        String photoUrl,
        Boolean approved,
        Double sellerRating
) {
}
