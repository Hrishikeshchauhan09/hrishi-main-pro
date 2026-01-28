package com.hrishikesh.inventory.service;

import com.hrishikesh.inventory.entity.Payment;
import com.hrishikesh.inventory.entity.PurchaseOrder;
import com.hrishikesh.inventory.repository.PaymentRepository;
import com.hrishikesh.inventory.repository.PurchaseOrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByOrder(Long orderId) {
        return paymentRepository.findByPurchaseOrderId(orderId);
    }

    @Transactional
    public Payment createPayment(Payment payment) {
        // Validate purchase order exists
        PurchaseOrder order = purchaseOrderRepository.findById(payment.getPurchaseOrder().getId())
                .orElseThrow(
                        () -> new RuntimeException("Purchase order not found: " + payment.getPurchaseOrder().getId()));

        // Validate payment amount doesn't exceed order total
        BigDecimal totalPaid = getTotalPaid(order.getId());
        BigDecimal newTotal = totalPaid.add(payment.getAmount());

        if (newTotal.compareTo(order.getTotalAmount()) > 0) {
            throw new RuntimeException("Payment amount exceeds order total. Outstanding: " +
                    getOutstandingBalance(order.getId()));
        }

        payment.setPurchaseOrder(order);
        return paymentRepository.save(payment);
    }

    public BigDecimal getTotalPaid(Long orderId) {
        List<Payment> payments = paymentRepository.findByPurchaseOrderId(orderId);
        return payments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getOutstandingBalance(Long orderId) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Purchase order not found: " + orderId));

        BigDecimal totalPaid = getTotalPaid(orderId);
        return order.getTotalAmount().subtract(totalPaid);
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + id));
    }
}
