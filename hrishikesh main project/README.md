# Inventory & Purchase Management System

A full-stack application for managing Vendors, Inventory, and Purchase Orders. Built with Spring Boot and Vanilla JavaScript.

## 🚀 Features
*   **Vendor Management:** Add and view suppliers.
*   **Inventory Tracking:** Real-time stock updates.
*   **Purchase Orders:** Create orders and receive goods.
*   **Automated Stock Update:** Receiving goods automatically increases inventory.
*   **Dashboard:** Key metrics at a glance.

## 🛠 Tech Stack
*   **Backend:** Spring Boot 3.2 (Java 17)
*   **Database:** MySQL 8.0
*   **Frontend:** HTML5, Bootstrap 5, Vanilla JS (Fetch API)

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

## 🧪 Testing the Flow
1.  Go to **Vendors** -> Add a new Vendor (e.g., "Samsung").
2.  Go to **Inventory** -> Add a new Product (e.g., "Galaxy S24", SKU: "S24-BLK", Stock: 0).
3.  Go to **Purchase Orders** -> Create Order -> Select Vendor & Product -> Enter Qty (e.g., 10).
4.  In the Order List, click **"Receive Goods"**.
5.  Go back to **Inventory** -> Check that Stock is now **10**.

## 📂 Project Structure
*   `src/main/java`: Backend Logic (Controllers, Services, Entities)
*   `src/main/resources/static`: Frontend UI (HTML, CSS, JS)
