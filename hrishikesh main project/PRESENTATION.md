# Project Presentation Guide

## 1. Project Overview
**Title:** Inventory & Purchase Management System (Complete ERP)  
**Goal:** A full-stack enterprise application to manage the complete procurement-to-payment cycle, including vendor management, purchase order approval workflow, goods receipt (full and partial), inventory tracking, and payment management.

**Key Achievement:** Built a production-ready ERP system with advanced features like multi-step approval workflow, partial goods receipt, and comprehensive payment tracking.

---

## 2. User Interface (UI) Walkthrough
The UI is built using **HTML5, Bootstrap 5, and Vanilla JavaScript**. It is designed to be clean, responsive, and enterprise-grade.

### Pages Overview

*   **Dashboard (`/`):**
    *   Acts as the control center.
    *   Displays key metrics: Total Vendors, Total Products, Pending Orders, and Low Stock Alerts.
    *   *Data Flow:* Fetches summary data from multiple APIs (`/api/vendors`, `/api/products`, `/api/orders`) in parallel using Promise.all().

*   **Vendor Management (`/vendors.html`):**
    *   Allows adding new suppliers to the system.
    *   Lists all existing vendors with contact details (name, phone, email, address).
    *   *Use Case:* Maintain supplier database for procurement.

*   **Inventory (`/inventory.html`):**
    *   Shows the current stock of all products with SKU, price, and quantity.
    *   Highlights items with **Low Stock** (Red text) for immediate attention.
    *   Allows defining new products with unique SKU.
    *   *Real-time Updates:* Stock automatically updates when goods are received.

*   **Purchase Orders (`/orders.html`) - The Core Feature:**
    *   **Create Order:** Select a Vendor → Add multiple products → Specify quantities.
    *   **Dynamic Action Buttons** based on order status:
        *   **PENDING:** "Approve" and "Cancel" buttons
        *   **APPROVED:** "Partial Receipt", "Receive All", and "Cancel" buttons
        *   **RECEIVED:** "Completed" badge (no actions)
        *   **CANCELLED:** "Cancelled" badge (no actions)
    *   **Approval Workflow:** Orders must be approved before goods can be received.
    *   **Partial Receipt Modal:** Shows all order items with ordered/received/remaining quantities.
    *   **Status Tracking:** Visual badges (Yellow=PENDING, Blue=APPROVED, Green=RECEIVED, Gray=CANCELLED).

*   **Payments (`/payments.html`) - NEW:**
    *   **Payment List:** Shows all payments with order ID, vendor, amount, date, method, status.
    *   **Record Payment:** Modal form with:
        *   Order selection (only APPROVED/RECEIVED orders shown)
        *   Auto-calculated order summary (total, paid, outstanding)
        *   Payment amount (defaults to outstanding balance)
        *   Payment method dropdown (Cash, Bank Transfer, Cheque, Credit Card, UPI, Other)
        *   Transaction reference and notes fields
    *   **Validation:** Prevents overpayment (amount cannot exceed outstanding balance).

---

## 3. Backend Logic & Architecture
The backend is built on **Spring Boot 3.2** using a **Layered Architecture** with proper separation of concerns.

### Layers:

1.  **Controller Layer (`/controller`):**
    *   Exposes RESTful APIs (e.g., `POST /api/orders`, `POST /api/payments`).
    *   Handles HTTP requests and responses (JSON format).
    *   Uses `@CrossOrigin` for frontend-backend communication.

2.  **Service Layer (`/service`):**
    *   Contains all business logic and validation.
    *   **Key Services:**
        *   `PurchaseOrderService`:
            *   `createOrder()` - Creates order with items
            *   `approveOrder()` - Changes status PENDING → APPROVED
            *   `cancelOrder()` - Changes status to CANCELLED
            *   `receiveGoods()` - Receives all items, updates inventory
            *   `receivePartialGoods()` - Receives partial quantity for specific item
        *   `PaymentService`:
            *   `createPayment()` - Records payment with validation
            *   `getTotalPaid()` - Calculates total paid for an order
            *   `getOutstandingBalance()` - Calculates remaining amount due
    *   **Transaction Management:** Uses `@Transactional` to ensure:
        *   Atomic operations (all-or-nothing)
        *   Automatic rollback on errors
        *   Data consistency across multiple tables

3.  **Repository Layer (`/repository`):**
    *   Interfaces with the Database using **Spring Data JPA**.
    *   Eliminates boilerplate SQL code.
    *   Custom query methods (e.g., `findByPurchaseOrderId()`).

4.  **Entity Layer (`/entity`):**
    *   JPA entities representing database tables:
        *   `Vendor` - Supplier information
        *   `Product` - Inventory items
        *   `PurchaseOrder` - Order header with status enum
        *   `OrderItem` - Order line items with `receivedQuantity` tracking
        *   `Payment` - Payment records with method and status enums

---

## 4. Advanced Features Explained

### Feature 1: Approval Workflow

**Business Need:** Prevent unauthorized inventory changes. Orders must be reviewed and approved before goods can be received.

**Implementation:**
*   Order status enum: `PENDING`, `APPROVED`, `RECEIVED`, `CANCELLED`
*   State transitions:
    ```
    PENDING → (approve) → APPROVED → (receive) → RECEIVED
       ↓                      ↓
    (cancel)             (cancel)
       ↓                      ↓
    CANCELLED            CANCELLED
    ```
*   **Validation:** `receiveGoods()` method checks if order is APPROVED before allowing receipt.
*   **UI:** Dynamic buttons based on current status.

**Code Example:**
```java
@Transactional
public PurchaseOrder approveOrder(Long orderId) {
    PurchaseOrder order = poRepository.findById(orderId)
        .orElseThrow(() -> new RuntimeException("Order not found"));
    
    if (order.getStatus() != OrderStatus.PENDING) {
        throw new RuntimeException("Only pending orders can be approved");
    }
    
    order.setStatus(OrderStatus.APPROVED);
    return poRepository.save(order);
}
```

---

### Feature 2: Partial Goods Receipt

**Business Need:** In real-world scenarios, vendors may ship goods in multiple batches. System must track what's been received vs. what's still pending.

**Implementation:**
*   Added `receivedQuantity` field to `OrderItem` entity (default: 0)
*   `receivePartialGoods(orderId, itemId, quantity)` method:
    1. Validates order is APPROVED
    2. Finds specific order item
    3. Validates quantity doesn't exceed remaining
    4. Updates inventory by partial amount
    5. Updates `receivedQuantity` in OrderItem
    6. Checks if all items fully received → marks order as RECEIVED

**Example Scenario:**
```
Order: 100 units of Product A
Day 1: Receive 60 units → receivedQuantity = 60, remaining = 40, status = APPROVED
Day 3: Receive 40 units → receivedQuantity = 100, remaining = 0, status = RECEIVED
```

**Code Example:**
```java
@Transactional
public PurchaseOrder receivePartialGoods(Long orderId, Long itemId, Integer quantity) {
    // ... validation ...
    
    int alreadyReceived = item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0;
    int remainingQuantity = item.getQuantity() - alreadyReceived;
    
    // Update inventory
    product.setCurrentStock(product.getCurrentStock() + quantity);
    
    // Update received quantity
    item.setReceivedQuantity(alreadyReceived + quantity);
    
    // Check if all items fully received
    boolean allReceived = order.getItems().stream()
        .allMatch(i -> (i.getReceivedQuantity() != null ? i.getReceivedQuantity() : 0) >= i.getQuantity());
    
    if (allReceived) {
        order.setStatus(OrderStatus.RECEIVED);
    }
    
    return poRepository.save(order);
}
```

---

### Feature 3: Payment Tracking

**Business Need:** Track payments made to vendors, calculate outstanding balances, prevent overpayment.

**Implementation:**
*   New `Payment` entity with fields:
    *   `purchaseOrder` (ManyToOne relationship)
    *   `amount`, `paymentDate`, `paymentMethod`, `status`
    *   `transactionReference`, `notes`
*   Payment validation:
    *   Fetches total already paid for the order
    *   Validates new payment doesn't exceed order total
    *   Throws exception if overpayment attempted
*   Payment summary endpoint:
    *   Returns `totalPaid` and `outstanding` balance
    *   Used by UI to show real-time payment status

**Code Example:**
```java
@Transactional
public Payment createPayment(Payment payment) {
    PurchaseOrder order = purchaseOrderRepository.findById(payment.getPurchaseOrder().getId())
        .orElseThrow(() -> new RuntimeException("Purchase order not found"));
    
    BigDecimal totalPaid = getTotalPaid(order.getId());
    BigDecimal newTotal = totalPaid.add(payment.getAmount());
    
    if (newTotal.compareTo(order.getTotalAmount()) > 0) {
        throw new RuntimeException("Payment amount exceeds order total. Outstanding: " + 
            getOutstandingBalance(order.getId()));
    }
    
    return paymentRepository.save(payment);
}
```

---

## 5. Data Flow Examples

### Scenario 1: Receiving Goods (Full Receipt)
1.  **User Action:** Clicks "Receive All" button on APPROVED order.
2.  **Frontend:** JS sends `POST /api/orders/{id}/receive` fetch request.
3.  **Controller:** `PurchaseOrderController.receiveGoods()` receives request.
4.  **Service:** `PurchaseOrderService.receiveGoods()`:
    *   Validates order is APPROVED
    *   Loads Order with items from DB
    *   For each item: Updates Product stock (+quantity)
    *   Sets `receivedQuantity = quantity` for each item
    *   Updates Order status to RECEIVED
5.  **Database:** Commits changes to `product`, `order_item`, `purchase_order` tables (atomic transaction).
6.  **Response:** Backend sends `200 OK`. UI shows success message and reloads order list.

### Scenario 2: Recording Payment
1.  **User Action:** Opens payment modal, selects order.
2.  **Frontend:** Fetches payment summary via `GET /api/payments/order/{orderId}/summary`.
3.  **Backend:** Calculates and returns `{totalPaid: 50.00, outstanding: 50.00}`.
4.  **Frontend:** Displays summary, user enters amount and submits.
5.  **Frontend:** Sends `POST /api/payments` with payment data.
6.  **Service:** `PaymentService.createPayment()`:
    *   Validates payment doesn't exceed outstanding
    *   Saves payment to database
7.  **Response:** Payment recorded, UI refreshes payment table.

---

## 6. Design Decisions

*   **Why Spring Boot?**
    *   Industry standard for Enterprise Java applications.
    *   Provides robust **Transaction Management** (essential for inventory and payment systems).
    *   Built-in dependency injection and auto-configuration.
    *   Easy integration with databases via Spring Data JPA.

*   **Why Vanilla JS + Fetch API?**
    *   Keeps the frontend lightweight and fast.
    *   Demonstrates understanding of core Web APIs without relying on heavy frameworks.
    *   Suitable for this project size (5 pages, focused functionality).
    *   Easy to understand and maintain.

*   **Why MySQL?**
    *   **Persistent storage** (unlike H2 in-memory database).
    *   **Relational structure** is perfect for structured data like Orders, Items, Payments.
    *   **ACID compliance** ensures data integrity for financial transactions.
    *   Industry-standard database with excellent tooling.

*   **Why Layered Architecture?**
    *   **Separation of Concerns:** Each layer has a specific responsibility.
    *   **Testability:** Business logic in Service layer can be unit tested independently.
    *   **Maintainability:** Changes in one layer don't affect others.
    *   **Scalability:** Easy to add new features without breaking existing code.

*   **Why Enums for Status?**
    *   **Type Safety:** Prevents invalid status values.
    *   **Readability:** `OrderStatus.APPROVED` is clearer than `"APPROVED"` string.
    *   **Validation:** Database enforces valid values automatically.

---

## 7. Technical Highlights

### Transaction Management
All critical operations use `@Transactional` annotation:
*   **Atomic Operations:** Either all changes succeed or all fail (no partial updates).
*   **Rollback on Error:** If any step fails, entire transaction is rolled back.
*   **Example:** When receiving goods, if inventory update fails, order status won't change.

### Null Safety
Added null-safety checks for backward compatibility:
```java
int alreadyReceived = item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0;
```
This handles orders created before the `receivedQuantity` field was added.

### Validation
*   **Backend Validation:** All critical validations in Service layer.
*   **Frontend Validation:** HTML5 `required` attributes and JavaScript checks.
*   **Database Constraints:** Unique SKU, foreign key relationships.

### Error Handling
*   Meaningful error messages returned to frontend.
*   Try-catch blocks in critical sections.
*   User-friendly alerts in UI.

---

## 8. API Documentation

### Purchase Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `POST /api/orders/{id}/approve` - Approve pending order
- `POST /api/orders/{id}/cancel` - Cancel order
- `POST /api/orders/{id}/receive` - Receive all goods
- `POST /api/orders/{orderId}/receive-partial` - Receive partial quantity
  - Request body: `{"itemId": 1, "quantity": 5}`

### Payments
- `GET /api/payments` - List all payments
- `POST /api/payments` - Create payment
- `GET /api/payments/order/{orderId}` - Get payments for specific order
- `GET /api/payments/order/{orderId}/summary` - Get payment summary
  - Response: `{"totalPaid": 50.00, "outstanding": 50.00}`
- `GET /api/payments/{id}` - Get payment by ID

---

## 9. Database Schema

### Tables
1. **vendor** - Supplier information
2. **product** - Inventory items with current stock
3. **purchase_order** - Order header with status
4. **order_item** - Order line items with received quantity tracking
5. **payment** - Payment records linked to orders

### Key Relationships
- `purchase_order` → `vendor` (ManyToOne)
- `order_item` → `purchase_order` (ManyToOne)
- `order_item` → `product` (ManyToOne)
- `payment` → `purchase_order` (ManyToOne)

---

## 10. Conclusion

This project demonstrates:
*   **Full-stack development** with Spring Boot and Vanilla JavaScript
*   **Enterprise-grade features** (approval workflow, partial receipt, payment tracking)
*   **Transaction management** for data consistency
*   **Clean architecture** with proper separation of concerns
*   **Real-world business logic** for procurement and inventory management
*   **RESTful API design** with proper HTTP methods and status codes
*   **Responsive UI** with Bootstrap 5
*   **Database design** with proper relationships and constraints

**Result:** A production-ready ERP system that can be deployed and used for actual business operations.
