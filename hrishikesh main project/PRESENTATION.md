# Project Presentation Guide

## 1. Project Overview
**Title:** Inventory & Purchase Management System
**Goal:** A full-stack application to manage the procurement cycle (Procure-to-Pay), tracking vendors, purchase orders, and real-time inventory levels.

## 2. User Interface (UI) Walkthrough
The UI is built using **HTML5, Bootstrap 5, and Vanilla JavaScript**. It is designed to be clean, responsive, and fast.

*   **Dashboard:**
    *   Acts as the control center.
    *   Displays key metrics: Total Vendors, Total Products, Pending Orders, and Low Stock Alerts.
    *   *Data Flow:* Fetches summary data from multiple APIs (`/api/vendors`, `/api/products`, `/api/orders`) in parallel.
*   **Vendor Management:**
    *   Allows adding new suppliers to the system.
    *   Lists all existing vendors with contact details.
*   **Inventory:**
    *   Shows the current stock of all products.
    *   Highlights items with **Low Stock** (Red text) for immediate attention.
    *   Allows defining new products (SKU, Price, Description).
*   **Purchase Orders (The Core Feature):**
    *   **Create Order:** Select a Vendor -> Add Products -> Specify Quantity.
    *   **Receive Goods:** A critical feature. When goods arrive, the user clicks "Receive". This triggers a backend transaction that **automatically updates the inventory count**.

## 3. Backend Logic & Architecture
The backend is built on **Spring Boot 3.2** using a Layered Architecture.

### Layers:
1.  **Controller Layer (`/controller`):**
    *   Exposes REST APIs (e.g., `POST /api/orders`).
    *   Handles HTTP requests and responses (JSON).
2.  **Service Layer (`/service`):**
    *   Contains the business logic.
    *   *Key Logic:* `PurchaseOrderService.receiveGoods()`
        *   Verifies order status.
        *   Loops through order items.
        *   Updates `Product.currentStock = currentStock + receivedQuantity`.
        *   Marks order as `RECEIVED`.
    *   **Transaction Management:** Uses `@Transactional` to ensure that if stock update fails, the order status is not changed (Atomicity).
3.  **Repository Layer (`/repository`):**
    *   Interfaces with the Database using **Spring Data JPA**.
    *   Eliminates boilerplate SQL code.

## 4. Data Flow
**Scenario: Receiving Goods**
1.  **User Action:** Clicks "Receive Goods" button on UI.
2.  **Frontend:** JS sends `POST /api/orders/{id}/receive` fetch request.
3.  **Controller:** Receives request, calls `PurchaseOrderService`.
4.  **Service:**
    *   Loads Order from DB.
    *   Updates Product Stock in DB.
    *   Updates Order Status in DB.
5.  **Database:** Commits changes to MySQL tables (`product`, `purchase_order`).
6.  **Response:** Backend sends `200 OK`. UI reloads to show updated stock.

## 5. Design Decisions
*   **Why Spring Boot?**
    *   Industry standard for Enterprise apps.
    *   Provides robust Transaction Management (essential for inventory).
*   **Why Vanilla JS + Fetch?**
    *   Keeps the frontend lightweight.
    *   Demonstrates understanding of core Web APIs without relying on heavy frameworks like React/Angular for a mini-project.
*   **Why MySQL?**
    *   Persistent storage (unlike H2).
    *   Relational structure is perfect for structured data like Orders and Inventory.
