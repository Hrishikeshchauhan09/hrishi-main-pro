# Inventory & Purchase Management System

A complete ERP system for managing Vendors, Inventory, Purchase Orders, and Payments. Built with Spring Boot and Vanilla JavaScript.

## 🚀 Features

### Core Modules
*   **Vendor Management:** Add and view suppliers with contact information.
*   **Inventory Tracking:** Real-time stock updates with low stock alerts.
*   **Purchase Orders:** Create multi-item orders with approval workflow.
*   **Payment Tracking:** Record and track vendor payments with outstanding balance calculation.

### Advanced Features
*   **Approval Workflow:** Multi-step order approval (PENDING → APPROVED → RECEIVED).
*   **Partial Goods Receipt:** Receive goods incrementally as they arrive.
*   **Automated Stock Update:** Receiving goods automatically increases inventory.
*   **Payment Management:** Track payments against orders with automatic balance calculation.
*   **Transaction Safety:** All critical operations use database transactions for data consistency.
*   **Dashboard:** Key metrics at a glance (vendors, products, pending orders, low stock).

## 🛠 Tech Stack
*   **Backend:** Spring Boot 3.2 (Java 17)
*   **Database:** MySQL 8.0
*   **Frontend:** HTML5, Bootstrap 5, Vanilla JS (Fetch API)
*   **Architecture:** Layered (Controller → Service → Repository)

## 🏃‍♂️ How to Run

### 1. Database Setup (MySQL)
1.  Make sure MySQL Server is running.
2.  Create a database named `hrishi_inventory_db`:
    ```sql
    CREATE DATABASE hrishi_inventory_db;
    ```
3.  Update `src/main/resources/application.properties` with your MySQL username and password if they are not `root/root`.

### 2. Run Application
1.  Open a terminal in the project root.
2.  Run the application:
    ```bash
    mvn spring-boot:run
    ```
3.  Open your browser and go to: **http://localhost:8082**

## 📖 Project Presentation
For a detailed explanation of the UI, Backend Logic, and Design Decisions, please read [PRESENTATION.md](PRESENTATION.md).

## 🧪 Testing the Complete Workflow

### 1. Setup Phase
1.  Go to **Vendors** → Add a new Vendor (e.g., "Samsung").
2.  Go to **Inventory** → Add a new Product (e.g., "Galaxy S24", SKU: "S24-BLK", Stock: 0).

### 2. Purchase Order Workflow
1.  Go to **Purchase Orders** → Click "Create New Purchase Order".
2.  Select Vendor & Product → Enter Quantity (e.g., 10) → Submit.
3.  Order is created with status **PENDING**.

### 3. Approval Workflow
1.  In the Order List, click **"Approve"** button.
2.  Order status changes to **APPROVED**.

### 4. Goods Receipt (Choose One)

**Option A: Receive All Goods**
1.  Click **"Receive All"** button.
2.  Inventory is updated (+10 units).
3.  Order status changes to **RECEIVED**.

**Option B: Partial Receipt**
1.  Click **"Partial Receipt"** button.
2.  Modal opens showing all order items.
3.  Enter quantity to receive (e.g., 5 out of 10).
4.  Click "Receive" → Inventory updates (+5 units).
5.  Repeat for remaining quantity when goods arrive.
6.  Order automatically marks as **RECEIVED** when all items received.

### 5. Payment Tracking
1.  Go to **Payments** → Click "Record New Payment".
2.  Select the order from dropdown.
3.  System shows: Total Amount, Already Paid, Outstanding Balance.
4.  Enter payment amount and method → Submit.
5.  Payment is recorded and table updates.

### 6. Verification
1.  Go back to **Inventory** → Check that Stock is updated correctly.
2.  Check **Dashboard** → See updated metrics.

## 📂 Project Structure
*   `src/main/java/com/hrishikesh/inventory/`
    *   `controller/` - REST API endpoints
    *   `service/` - Business logic and transaction management
    *   `repository/` - Database access layer
    *   `entity/` - JPA entities (Vendor, Product, PurchaseOrder, OrderItem, Payment)
*   `src/main/resources/`
    *   `static/` - Frontend UI (HTML, CSS, JS)
    *   `application.properties` - Database configuration

## 🔗 API Endpoints

### Vendors
- `GET /api/vendors` - List all vendors
- `POST /api/vendors` - Create vendor

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product

### Purchase Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create order
- `POST /api/orders/{id}/approve` - Approve order
- `POST /api/orders/{id}/cancel` - Cancel order
- `POST /api/orders/{id}/receive` - Receive all goods
- `POST /api/orders/{orderId}/receive-partial` - Receive partial quantity

### Payments
- `GET /api/payments` - List all payments
- `POST /api/payments` - Create payment
- `GET /api/payments/order/{orderId}` - Get payments for order
- `GET /api/payments/order/{orderId}/summary` - Get payment summary

## 🎯 Key Features Explained

### 1. Approval Workflow
Orders must be approved before goods can be received. This ensures proper authorization and prevents unauthorized inventory changes.

**States:** PENDING → APPROVED → RECEIVED (or CANCELLED)

### 2. Partial Goods Receipt
Real-world scenario: Vendor ships 100 units but only 60 arrive today. You can:
- Receive 60 units now (inventory +60)
- Receive remaining 40 units when they arrive (inventory +40)
- System tracks received vs. ordered quantities
- Order auto-completes when all items fully received

### 3. Payment Tracking
- Record multiple payments against a single order
- System calculates total paid and outstanding balance
- Prevents overpayment (validates against order total)
- Track payment method and transaction references

### 4. Transaction Safety
All critical operations use `@Transactional` annotation to ensure:
- Atomic operations (all-or-nothing)
- Data consistency across tables
- Automatic rollback on errors

## 🛡️ Data Validation
- SKU uniqueness enforced
- Payment amount cannot exceed order total
- Cannot receive more goods than ordered
- Cannot cancel already received orders
- Cannot receive goods from unapproved orders

## 📊 Database Schema
- **vendor** - Supplier information
- **product** - Inventory items with current stock
- **purchase_order** - Order header with status
- **order_item** - Order line items with received quantity tracking
- **payment** - Payment records linked to orders

## 🎨 UI Pages
1. **Dashboard** (`/`) - Overview metrics
2. **Vendors** (`/vendors.html`) - Vendor management
3. **Inventory** (`/inventory.html`) - Product and stock management
4. **Purchase Orders** (`/orders.html`) - Order management with workflow
5. **Payments** (`/payments.html`) - Payment tracking

## 🔧 Technologies Used
- **Spring Boot** - Application framework
- **Spring Data JPA** - Database ORM
- **MySQL** - Persistent storage
- **Bootstrap 5** - Responsive UI
- **Fetch API** - Asynchronous HTTP requests
- **Maven** - Build and dependency management

## 📝 License
This project is for educational purposes.
