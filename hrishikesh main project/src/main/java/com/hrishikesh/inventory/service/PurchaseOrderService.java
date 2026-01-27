package com.hrishikesh.inventory.service;

import com.hrishikesh.inventory.entity.OrderItem;
import com.hrishikesh.inventory.entity.Product;
import com.hrishikesh.inventory.entity.PurchaseOrder;
import com.hrishikesh.inventory.repository.ProductRepository;
import com.hrishikesh.inventory.repository.PurchaseOrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository poRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<PurchaseOrder> getAllOrders() {
        return poRepository.findAll();
    }

    @Transactional
    public PurchaseOrder createOrder(PurchaseOrder order) {
        // Link items to order
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setPurchaseOrder(order);
                // Verify product exists
                productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProduct().getId()));
            }
        }
        return poRepository.save(order);
    }

    @Transactional
    public PurchaseOrder receiveGoods(Long orderId) {
        PurchaseOrder order = poRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() == PurchaseOrder.OrderStatus.RECEIVED) {
            throw new RuntimeException("Order already received");
        }

        // Update Inventory
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // Increase stock
            product.setCurrentStock(product.getCurrentStock() + item.getQuantity());
            productRepository.save(product);
        }

        // Update Order Status
        order.setStatus(PurchaseOrder.OrderStatus.RECEIVED);
        return poRepository.save(order);
    }
}
