package com.hrishikesh.inventory.controller;

import com.hrishikesh.inventory.entity.Payment;
import com.hrishikesh.inventory.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/order/{orderId}")
    public List<Payment> getPaymentsByOrder(@PathVariable Long orderId) {
        return paymentService.getPaymentsByOrder(orderId);
    }

    @GetMapping("/order/{orderId}/summary")
    public ResponseEntity<Map<String, BigDecimal>> getPaymentSummary(@PathVariable Long orderId) {
        Map<String, BigDecimal> summary = new HashMap<>();
        summary.put("totalPaid", paymentService.getTotalPaid(orderId));
        summary.put("outstanding", paymentService.getOutstandingBalance(orderId));
        return ResponseEntity.ok(summary);
    }

    @PostMapping
    public ResponseEntity<Payment> createPayment(@RequestBody Payment payment) {
        return ResponseEntity.ok(paymentService.createPayment(payment));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }
}
