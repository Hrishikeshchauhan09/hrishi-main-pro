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
    } else if (path.endsWith('payments.html')) {
        loadPayments();
        setupPaymentForm();
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

        // Dynamic action buttons based on status
        let actionBtns = '';
        if (o.status === 'PENDING') {
            actionBtns = `
                <button class="btn btn-sm btn-success me-1" onclick="approveOrder(${o.id})">Approve</button>
                <button class="btn btn-sm btn-danger" onclick="cancelOrder(${o.id})">Cancel</button>
            `;
        } else if (o.status === 'APPROVED') {
            actionBtns = `
                <button class="btn btn-sm btn-primary me-1" onclick="showPartialReceiptModal(${o.id})">Partial Receipt</button>
                <button class="btn btn-sm btn-success me-1" onclick="receiveOrder(${o.id})">Receive All</button>
                <button class="btn btn-sm btn-danger" onclick="cancelOrder(${o.id})">Cancel</button>
            `;
        } else if (o.status === 'RECEIVED') {
            actionBtns = '<span class="badge bg-success">Completed</span>';
        } else if (o.status === 'CANCELLED') {
            actionBtns = '<span class="badge bg-secondary">Cancelled</span>';
        }

        // Status badge colors
        const statusColors = {
            'PENDING': 'warning',
            'APPROVED': 'info',
            'RECEIVED': 'success',
            'CANCELLED': 'secondary'
        };

        tbody.innerHTML += `
            <tr>
                <td>#${o.id}</td>
                <td>${o.vendor.name}</td>
                <td>${date}</td>
                <td><span class="badge bg-${statusColors[o.status] || 'secondary'}">${o.status}</span></td>
                <td>${actionBtns}</td>
            </tr>
        `;
    });
}

async function receiveOrder(id) {
    if (!confirm('Confirm receipt of ALL goods? This will update inventory and mark order as RECEIVED.')) return;

    const res = await fetch(`${API_BASE}/orders/${id}/receive`, { method: 'POST' });
    if (res.ok) {
        alert('All Goods Received! Inventory Updated. Order marked as RECEIVED.');
        loadOrders();
    } else {
        const error = await res.text();
        alert('Error: ' + error);
    }
}

async function approveOrder(id) {
    if (!confirm('Approve this purchase order?')) return;

    const res = await fetch(`${API_BASE}/orders/${id}/approve`, { method: 'POST' });
    if (res.ok) {
        alert('Order Approved! You can now receive goods.');
        loadOrders();
    } else {
        const error = await res.text();
        alert('Error: ' + error);
    }
}

async function cancelOrder(id) {
    if (!confirm('Cancel this order? This action cannot be undone.')) return;

    const res = await fetch(`${API_BASE}/orders/${id}/cancel`, { method: 'POST' });
    if (res.ok) {
        alert('Order Cancelled.');
        loadOrders();
    } else {
        const error = await res.text();
        alert('Error: ' + error);
    }
}

async function showPartialReceiptModal(orderId) {
    // Fetch order details
    const res = await fetch(`${API_BASE}/orders`);
    const orders = await res.json();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        alert('Order not found');
        return;
    }

    // Build modal content
    let modalHTML = `
        <div class="modal fade" id="partialReceiptModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Partial Goods Receipt - Order #${orderId}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Vendor:</strong> ${order.vendor.name}</p>
                        <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
                        <hr>
                        <h6>Order Items:</h6>
    `;

    order.items.forEach(item => {
        const received = item.receivedQuantity || 0;
        const remaining = item.quantity - received;

        modalHTML += `
            <div class="mb-3 border p-2">
                <p class="mb-1"><strong>${item.product.name}</strong></p>
                <p class="mb-1 small">Ordered: ${item.quantity} | Received: ${received} | Remaining: ${remaining}</p>
                ${remaining > 0 ? `
                    <div class="input-group input-group-sm">
                        <input type="number" class="form-control" id="qty-${item.id}" 
                               min="1" max="${remaining}" value="${remaining}" placeholder="Quantity">
                        <button class="btn btn-primary" onclick="receivePartialItem(${orderId}, ${item.id}, ${remaining})">
                            Receive
                        </button>
                    </div>
                ` : '<span class="badge bg-success">Fully Received</span>'}
            </div>
        `;
    });

    modalHTML += `
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('partialReceiptModal');
    if (existingModal) existingModal.remove();

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('partialReceiptModal'));
    modal.show();
}

async function receivePartialItem(orderId, itemId, maxQty) {
    const qtyInput = document.getElementById(`qty-${itemId}`);
    const quantity = parseInt(qtyInput.value);

    if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }

    if (quantity > maxQty) {
        alert(`Cannot receive more than ${maxQty} items`);
        return;
    }

    const res = await fetch(`${API_BASE}/orders/${orderId}/receive-partial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity })
    });

    if (res.ok) {
        alert(`Received ${quantity} items! Inventory updated.`);
        // Close modal and reload
        bootstrap.Modal.getInstance(document.getElementById('partialReceiptModal')).hide();
        loadOrders();
    } else {
        const error = await res.text();
        alert('Error: ' + error);
    }
}

// Make functions global so onclick works
window.receiveOrder = receiveOrder;
window.approveOrder = approveOrder;
window.cancelOrder = cancelOrder;
window.showPartialReceiptModal = showPartialReceiptModal;
window.receivePartialItem = receivePartialItem;

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

// --- Payment Functions ---
async function loadPayments() {
    const res = await fetch(`${API_BASE}/payments`);
    const payments = await res.json();
    const tbody = document.getElementById('payment-table-body');
    tbody.innerHTML = '';

    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No payments recorded yet</td></tr>';
        return;
    }

    payments.forEach(p => {
        const date = new Date(p.paymentDate).toLocaleDateString();
        const statusColors = {
            'COMPLETED': 'success',
            'PENDING': 'warning',
            'FAILED': 'danger',
            'CANCELLED': 'secondary'
        };

        tbody.innerHTML += `
            <tr>
                <td>#${p.id}</td>
                <td>#${p.purchaseOrder.id}</td>
                <td>${p.purchaseOrder.vendor.name}</td>
                <td>$${p.amount}</td>
                <td>${date}</td>
                <td>${p.paymentMethod}</td>
                <td><span class="badge bg-${statusColors[p.status]}">${p.status}</span></td>
                <td>${p.transactionReference || '-'}</td>
            </tr>
        `;
    });
}

function setupPaymentForm() {
    // Load orders when modal opens
    const modal = document.getElementById('createPaymentModal');
    modal.addEventListener('show.bs.modal', async () => {
        const res = await fetch(`${API_BASE}/orders`);
        const orders = await res.json();
        const select = document.getElementById('paymentOrderSelect');
        select.innerHTML = '<option value="">Choose...</option>';

        // Only show APPROVED or RECEIVED orders
        orders.filter(o => o.status === 'APPROVED' || o.status === 'RECEIVED').forEach(o => {
            select.innerHTML += `<option value="${o.id}">Order #${o.id} - ${o.vendor.name} ($${o.totalAmount})</option>`;
        });
    });

    // Show order summary when order is selected
    document.getElementById('paymentOrderSelect').addEventListener('change', async (e) => {
        const orderId = e.target.value;
        const summaryDiv = document.getElementById('order-summary');

        if (!orderId) {
            summaryDiv.innerHTML = '';
            return;
        }

        const res = await fetch(`${API_BASE}/payments/order/${orderId}/summary`);
        const summary = await res.json();

        summaryDiv.innerHTML = `
            <strong>Order Total:</strong> $${summary.totalPaid + summary.outstanding}<br>
            <strong>Total Paid:</strong> $${summary.totalPaid}<br>
            <strong>Outstanding:</strong> <span class="text-${summary.outstanding > 0 ? 'danger' : 'success'}">$${summary.outstanding}</span>
        `;

        // Set max amount
        document.getElementById('paymentAmount').max = summary.outstanding;
        document.getElementById('paymentAmount').value = summary.outstanding;
    });

    // Submit payment
    document.getElementById('create-payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const payment = {
            purchaseOrder: { id: parseInt(document.getElementById('paymentOrderSelect').value) },
            amount: parseFloat(document.getElementById('paymentAmount').value),
            paymentMethod: document.getElementById('paymentMethod').value,
            transactionReference: document.getElementById('transactionReference').value,
            notes: document.getElementById('paymentNotes').value
        };

        const res = await fetch(`${API_BASE}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payment)
        });

        if (res.ok) {
            alert('Payment Recorded Successfully!');
            bootstrap.Modal.getInstance(modal).hide();
            e.target.reset();
            document.getElementById('order-summary').innerHTML = '';
            loadPayments();
        } else {
            const error = await res.text();
            alert('Error: ' + error);
        }
    });
}
