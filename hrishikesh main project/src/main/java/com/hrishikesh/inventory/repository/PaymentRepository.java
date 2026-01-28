package com.hrishikesh.inventory.repository;

import com.hrishikesh.inventory.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByPurchaseOrderId(Long purchaseOrderId);

    List<Payment> findByStatus(Payment.PaymentStatus status);
}
