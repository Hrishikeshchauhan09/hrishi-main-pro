// Base API URL
const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path === '/' || path.endsWith('index.html')) {
        loadDashboardStats();
    } else if (path.endsWith('vendors.html')) {
        loadVendors();
        setupVendorForm();
    } else if (path.endsWith('inventory.html')) {
        loadProducts();
        setupProductForm();
    } else if (path.endsWith('orders.html')) {
        loadOrders();
        setupOrderForm();
    }
});

// --- Dashboard Functions ---
async function loadDashboardStats() {
    try {
        const [vendors, products, orders] = await Promise.all([
            fetch(`${API_BASE}/vendors`).then(res => res.json()),
            fetch(`${API_BASE}/products`).then(res => res.json()),
            fetch(`${API_BASE}/orders`).then(res => res.json())
        ]);

        document.getElementById('total-vendors').innerText = vendors.length;
        document.getElementById('total-products').innerText = products.length;

        const pending = orders.filter(o => o.status === 'PENDING').length;
        document.getElementById('pending-orders').innerText = pending;

        const lowStock = products.filter(p => p.currentStock < 10).length;
        document.getElementById('low-stock').innerText = lowStock;

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// --- Vendor Functions ---
async function loadVendors() {
    const res = await fetch(`${API_BASE}/vendors`);
    const vendors = await res.json();
    const tbody = document.getElementById('vendor-table-body');
    tbody.innerHTML = '';

    vendors.forEach(v => {
        tbody.innerHTML += `
            <tr>
                <td>${v.id}</td>
                <td>${v.name}</td>
                <td>${v.contactNumber}</td>
                <td>${v.email || '-'}</td>
                <td>${v.address || '-'}</td>
            </tr>
        `;
    });
}

function setupVendorForm() {
    document.getElementById('add-vendor-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const vendor = {
            name: document.getElementById('vendorName').value,
            contactNumber: document.getElementById('vendorContact').value,
            email: document.getElementById('vendorEmail').value,
            address: document.getElementById('vendorAddress').value
        };

        await fetch(`${API_BASE}/vendors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vendor)
        });

        e.target.reset();
        loadVendors();
    });
}

// --- Product/Inventory Functions ---
async function loadProducts() {
    const res = await fetch(`${API_BASE}/products`);
    const products = await res.json();
    const tbody = document.getElementById('product-table-body');
    tbody.innerHTML = '';

    products.forEach(p => {
        const statusClass = p.currentStock < 10 ? 'text-danger fw-bold' : 'text-success';
        const statusText = p.currentStock < 10 ? 'Low Stock' : 'In Stock';

        tbody.innerHTML += `
            <tr>
                <td>${p.sku}</td>
                <td>${p.name}</td>
                <td>$${p.unitPrice}</td>
                <td>${p.currentStock}</td>
                <td class="${statusClass}">${statusText}</td>
            </tr>
        `;
    });
}

function setupProductForm() {
    document.getElementById('add-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const product = {
            name: document.getElementById('productName').value,
            sku: document.getElementById('productSku').value,
            unitPrice: parseFloat(document.getElementById('productPrice').value),
            currentStock: parseInt(document.getElementById('productStock').value),
            description: document.getElementById('productDesc').value
        };

        const res = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });

        if (!res.ok) {
            alert('Error creating product (Check SKU)');
            return;
        }

        e.target.reset();
        loadProducts();
    });
}

// --- Purchase Order Functions ---
async function loadOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    const orders = await res.json();
    const tbody = document.getElementById('order-table-body');
    tbody.innerHTML = '';

    orders.forEach(o => {
        const date = new Date(o.orderDate).toLocaleDateString();
        const actionBtn = o.status === 'PENDING'
            ? `<button class="btn btn-sm btn-success" onclick="receiveOrder(${o.id})">Receive Goods</button>`
            : '<span class="badge bg-secondary">Completed</span>';

        tbody.innerHTML += `
            <tr>
                <td>#${o.id}</td>
                <td>${o.vendor.name}</td>
                <td>${date}</td>
                <td><span class="badge bg-${o.status === 'PENDING' ? 'warning' : 'success'}">${o.status}</span></td>
                <td>${actionBtn}</td>
            </tr>
        `;
    });
}

async function receiveOrder(id) {
    if (!confirm('Confirm receipt of goods? This will update inventory.')) return;

    const res = await fetch(`${API_BASE}/orders/${id}/receive`, { method: 'POST' });
    if (res.ok) {
        alert('Goods Received! Inventory Updated.');
        loadOrders();
    } else {
        alert('Error receiving goods');
    }
}

// Make receiveOrder global so onclick works
window.receiveOrder = receiveOrder;

function setupOrderForm() {
    // Load dropdowns when modal opens
    const modal = document.getElementById('createOrderModal');
    modal.addEventListener('show.bs.modal', async () => {
        // Load Vendors
        const vRes = await fetch(`${API_BASE}/vendors`);
        const vendors = await vRes.json();
        const vSelect = document.getElementById('orderVendorSelect');
        vSelect.innerHTML = '<option value="">Choose...</option>';
        vendors.forEach(v => vSelect.innerHTML += `<option value="${v.id}">${v.name}</option>`);

        // Load Products for the first item row
        loadProductsForSelect(document.querySelector('.product-select'));
    });

    // Add Item Row
    document.getElementById('add-item-btn').addEventListener('click', () => {
        const container = document.getElementById('order-items-container');
        const row = document.createElement('div');
        row.className = 'row mb-2 item-row';
        row.innerHTML = `
            <div class="col-6">
                <select class="form-select product-select" required><option>Loading...</option></select>
            </div>
            <div class="col-3">
                <input type="number" class="form-control quantity-input" placeholder="Qty" required>
            </div>
            <div class="col-3">
                <button type="button" class="btn btn-danger btn-sm remove-item">X</button>
            </div>
        `;
        container.appendChild(row);
        loadProductsForSelect(row.querySelector('.product-select'));

        row.querySelector('.remove-item').addEventListener('click', () => row.remove());
    });

    // Submit Order
    document.getElementById('create-order-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const vendorId = document.getElementById('orderVendorSelect').value;
        const items = [];

        document.querySelectorAll('.item-row').forEach(row => {
            const prodId = row.querySelector('.product-select').value;
            const qty = row.querySelector('.quantity-input').value;
            if (prodId && qty) {
                items.push({
                    product: { id: parseInt(prodId) },
                    quantity: parseInt(qty)
                });
            }
        });

        const order = {
            vendor: { id: parseInt(vendorId) },
            items: items
        };

        const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });

        if (res.ok) {
            alert('Order Created!');
            location.reload(); // Simple reload to clear form and refresh list
        } else {
            alert('Failed to create order');
        }
    });
}

async function loadProductsForSelect(selectElement) {
    const res = await fetch(`${API_BASE}/products`);
    const products = await res.json();
    selectElement.innerHTML = '<option value="">Select Product</option>';
    products.forEach(p => {
        selectElement.innerHTML += `<option value="${p.id}">${p.name} ($${p.unitPrice})</option>`;
    });
}
