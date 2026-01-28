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

        // Validate order is approved
        if (order.getStatus() != PurchaseOrder.OrderStatus.APPROVED) {
            throw new RuntimeException(
                    "Order must be approved before receiving goods. Current status: " + order.getStatus());
        }

        if (order.getStatus() == PurchaseOrder.OrderStatus.RECEIVED) {
            throw new RuntimeException("Order already received");
        }

        // Update Inventory for all items
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // Handle null receivedQuantity for backward compatibility
            int alreadyReceived = item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0;
            int quantityToReceive = item.getQuantity() - alreadyReceived;

            product.setCurrentStock(product.getCurrentStock() + quantityToReceive);
            productRepository.save(product);

            // Mark item as fully received
            item.setReceivedQuantity(item.getQuantity());
        }

        // Update Order Status
        order.setStatus(PurchaseOrder.OrderStatus.RECEIVED);
        return poRepository.save(order);
    }

    @Transactional
    public PurchaseOrder approveOrder(Long orderId) {
        PurchaseOrder order = poRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() != PurchaseOrder.OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be approved. Current status: " + order.getStatus());
        }

        order.setStatus(PurchaseOrder.OrderStatus.APPROVED);
        return poRepository.save(order);
    }

    @Transactional
    public PurchaseOrder cancelOrder(Long orderId) {
        PurchaseOrder order = poRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() == PurchaseOrder.OrderStatus.RECEIVED) {
            throw new RuntimeException("Cannot cancel received orders");
        }

        order.setStatus(PurchaseOrder.OrderStatus.CANCELLED);
        return poRepository.save(order);
    }

    @Transactional
    public PurchaseOrder receivePartialGoods(Long orderId, Long itemId, Integer quantity) {
        PurchaseOrder order = poRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        // Validate order is approved
        if (order.getStatus() != PurchaseOrder.OrderStatus.APPROVED) {
            throw new RuntimeException("Order must be approved before receiving goods");
        }

        // Find the specific item
        OrderItem item = order.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Order item not found: " + itemId));

        // Validate quantity
        int alreadyReceived = item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0;
        int remainingQuantity = item.getQuantity() - alreadyReceived;
        if (quantity > remainingQuantity) {
            throw new RuntimeException("Cannot receive more than ordered. Remaining: " + remainingQuantity);
        }

        // Update inventory
        Product product = productRepository.findById(item.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setCurrentStock(product.getCurrentStock() + quantity);
        productRepository.save(product);

        // Update received quantity
        item.setReceivedQuantity(alreadyReceived + quantity);

        // Check if all items are fully received
        boolean allReceived = order.getItems().stream()
                .allMatch(i -> {
                    int received = i.getReceivedQuantity() != null ? i.getReceivedQuantity() : 0;
                    return received >= i.getQuantity();
                });

        if (allReceived) {
            order.setStatus(PurchaseOrder.OrderStatus.RECEIVED);
        }

        return poRepository.save(order);
    }
}
