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
}
