package com.dibladi.dibladibackend.dto;

import com.dibladi.dibladibackend.entity.Vendor;

public record VendorResponse(
        Long id,
        String fullName,
        String shopName,
        String phone,
        String city,
        String address,
        String photoUrl,
        Integer score,
        Boolean approved,
        Long activeProductsCount,
        Long totalOrdersCount,
        Long last48hOrdersCount,
        Double sellerRating,
        String bankAccountHolderName,
        String bankName,
        String bankRib
) {
    public static VendorResponse from(Vendor vendor) {
        return from(vendor, 0L, 0L, 0L, 0.0);
    }

    public static VendorResponse from(Vendor vendor, Long activeProductsCount, Long totalOrdersCount, Long last48hOrdersCount) {
        return from(vendor, activeProductsCount, totalOrdersCount, last48hOrdersCount, 0.0);
    }

    public static VendorResponse from(Vendor vendor, Long activeProductsCount, Long totalOrdersCount, Long last48hOrdersCount, Double sellerRating) {
        return new VendorResponse(
                vendor.getId(),
                vendor.getFirstName() + " " + vendor.getLastName(),
                vendor.getShopName(),
                vendor.getPhone(),
                vendor.getCity(),
                vendor.getShopAddress(),
                vendor.getPhotoUrl(),
                vendor.getScore(),
                vendor.getIsApproved(),
                activeProductsCount != null ? activeProductsCount : 0L,
                totalOrdersCount != null ? totalOrdersCount : 0L,
                last48hOrdersCount != null ? last48hOrdersCount : 0L,
                sellerRating != null ? sellerRating : 0.0,
                vendor.getBankAccountHolderName(),
                vendor.getBankName(),
                vendor.getBankRib()
        );
    }
}

