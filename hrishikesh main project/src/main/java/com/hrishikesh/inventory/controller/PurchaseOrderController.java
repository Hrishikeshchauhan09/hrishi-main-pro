package com.hrishikesh.inventory.controller;

import com.hrishikesh.inventory.entity.PurchaseOrder;
import com.hrishikesh.inventory.service.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService poService;

    @GetMapping
    public List<PurchaseOrder> getAllOrders() {
        return poService.getAllOrders();
    }

    @PostMapping
    public ResponseEntity<PurchaseOrder> createOrder(@RequestBody PurchaseOrder order) {
        return ResponseEntity.ok(poService.createOrder(order));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<PurchaseOrder> receiveGoods(@PathVariable Long id) {
        return ResponseEntity.ok(poService.receiveGoods(id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<PurchaseOrder> approveOrder(@PathVariable Long id) {
        return ResponseEntity.ok(poService.approveOrder(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<PurchaseOrder> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(poService.cancelOrder(id));
    }

    @PostMapping("/{orderId}/receive-partial")
    public ResponseEntity<PurchaseOrder> receivePartialGoods(
            @PathVariable Long orderId,
            @RequestBody PartialReceiptRequest request) {
        return ResponseEntity.ok(poService.receivePartialGoods(orderId, request.getItemId(), request.getQuantity()));
    }

    // Inner class for partial receipt request
    public static class PartialReceiptRequest {
        private Long itemId;
        private Integer quantity;

        public Long getItemId() {
            return itemId;
        }

        public void setItemId(Long itemId) {
            this.itemId = itemId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
