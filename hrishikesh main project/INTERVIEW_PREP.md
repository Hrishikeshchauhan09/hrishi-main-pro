# Interview Preparation Guide: Peppermint Robotics

## 1. Company Overview (Peppermint Robotics)
*   **What they do:** They build **Autonomous Mobile Robots (AMRs)** for:
    *   **Industrial Cleaning:** Scrubber-dryer robots (SD45, SD20) for factories and warehouses.
    *   **Material Handling:** Robots that move goods in logistics hubs.
*   **Key Tech:** "Peppermint OS" (proprietary robot OS), LiDAR navigation, 360° safety sensors.
*   **Relevance to Your Project:**
    *   Their robots operate in **Warehouses**.
    *   Warehouses need **Inventory Management Systems (WMS)**.
    *   Your project manages Inventory, Vendors, and Purchase Orders—exactly what a warehouse needs to track spare parts for robots or the goods the robots are moving.

## 2. How to Pitch This Project
When they ask "Explain your project", say this:

> "I built a **Full-Stack Inventory & Procurement System** designed to handle the end-to-end supply chain flow.
>
> In a robotics company like Peppermint, you have hundreds of spare parts (LiDARs, motors, batteries) coming from different vendors. My system solves the problem of **tracking these parts**.
>
> It features a **Three-Way Match** mechanism:
> 1.  We raise a **Purchase Order** to a vendor.
> 2.  When goods arrive, the store manager clicks **'Receive'**.
> 3.  The system **automatically updates the inventory stock** in real-time.
>
> This ensures that physical stock always matches the digital record, which is critical for manufacturing efficiency."

## 3. Technical Questions You Might Face
### Q1: How do you handle data consistency?
*   **Answer:** "I used Spring Boot's `@Transactional` annotation. For example, when receiving goods, we update the `Product` table AND the `PurchaseOrder` table. If one fails, the entire transaction rolls back, so data never gets corrupted."

### Q2: Why did you use MySQL?
*   **Answer:** "Inventory data is structured and relational (Orders are linked to Vendors). MySQL enforces these relationships using Foreign Keys, ensuring data integrity."

### Q3: How would you scale this?
*   **Answer:** "Currently, it's a monolith. To scale, I would:
    1.  Introduce **Caching (Redis)** for frequent product lookups.
    2.  Use **Message Queues (Kafka)** to process stock updates asynchronously if the volume is huge."

## 4. Demo Strategy
1.  **Start with the Dashboard:** Show the "Low Stock" alert. Say, "This helps managers prioritize purchasing."
2.  **Show the Flow:**
    *   Create a Vendor ("Peppermint Suppliers").
    *   Create a Product ("LiDAR Sensor", Stock: 0).
    *   Create a PO for 10 units.
    *   **The Climax:** Click "Receive Goods" and show the stock jumping to 10. This proves the backend logic works.
