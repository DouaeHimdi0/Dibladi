package com.dibladi.dibladibackend.repository;

import com.dibladi.dibladibackend.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    java.util.List<Delivery> findByOrderIdIn(java.util.List<Long> orderIds);

    java.util.List<Delivery> findAllByOrderByCreatedAtDesc();
}
