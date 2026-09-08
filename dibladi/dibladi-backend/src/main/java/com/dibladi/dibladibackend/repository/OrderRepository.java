package com.dibladi.dibladibackend.repository;

import com.dibladi.dibladibackend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByClientIdOrderByCreatedAtDesc(Long clientId);

    List<Order> findByOrderNumberContainingIgnoreCaseAndClientIdOrderByCreatedAtDesc(String orderNumber, Long clientId);

    @Query("SELECT DISTINCT o FROM Order o JOIN OrderItem oi ON oi.order = o WHERE oi.vendor.id = :vendorId ORDER BY o.createdAt DESC")
    List<Order> findDistinctByItemsVendorIdOrderByCreatedAtDesc(@Param("vendorId") Long vendorId);
}
