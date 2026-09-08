package com.dibladi.dibladibackend.service;

import com.dibladi.dibladibackend.dto.BrandResponse;
import com.dibladi.dibladibackend.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;

    public List<BrandResponse> getActiveBrands() {
        return brandRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(BrandResponse::from)
                .collect(Collectors.toList());
    }
}
