const API_BASE = 'http://localhost:5000/api';
let currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadDashboardData();
    setupEventListeners();
});

// --- AUTHENTICATION ---
function checkAdminAuth() {
    if (!currentAdmin) {
        window.location.href = 'login.html';
        return;
    }
    const adminNameElement = document.getElementById('admin-name');
    if (adminNameElement) adminNameElement.textContent = currentAdmin.name;
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    document.getElementById('toggle-add-product-btn')?.addEventListener('click', toggleAddProductForm);


    document.getElementById('admin-logout-btn')?.addEventListener('click', adminLogout);
    document.getElementById('add-product-form')?.addEventListener('submit', handleAddProduct);
    document.getElementById('status-update-form')?.addEventListener('submit', handleStatusUpdate);
    
    // Add listeners for ALL modal close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => btn.addEventListener('click', closeModal));
    document.querySelectorAll('.modal-cancel-btn').forEach(btn => btn.addEventListener('click', closeModal));
}
function toggleAddProductForm() {
    const form = document.getElementById('add-product-form');
    const button = document.getElementById('toggle-add-product-btn');
    const icon = button.querySelector('i');

    // Toggle the 'hidden' class on the form
    form.classList.toggle('hidden');

    // Change the button text and icon for better user experience
    if (form.classList.contains('hidden')) {
        button.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Product';
    } else {
        button.innerHTML = '<i class="fas fa-minus-circle"></i> Hide Form';
    }
}


// --- DATA LOADING ---
async function loadDashboardData() {
    try {
        await Promise.all([loadStats(), loadOrders(), loadCustomers()]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadStats() {
    // This function remains the same
    try {
        const response = await fetch(`${API_BASE}/admin/stats`);
        const stats = await response.json();
        document.getElementById('total-users').textContent = stats.totalUsers;
        document.getElementById('total-orders').textContent = stats.totalOrders;
        document.getElementById('total-products').textContent = stats.totalProducts;
        document.getElementById('total-revenue').textContent = `₹${stats.totalRevenue.toFixed(2)}`;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadOrders() {
    // This function is updated to include the new "View Details" button
    try {
        const response = await fetch(`${API_BASE}/orders`);
        const orders = await response.json();
        const tbody = document.getElementById('orders-tbody');
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No orders found.</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.orderId}</td>
                <td>${order.userName}</td>
                <td>${order.items.length}</td>
                <td>$${order.totalAmount.toFixed(2)}</td>
                <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td class="action-buttons">
                    <button class="btn btn-info action-btn" onclick="openDetailsModal('${order.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-primary action-btn" onclick="openStatusModal('${order.id}', '${order.orderId}', '${order.status}')">
                        <i class="fas fa-edit"></i> Status
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('orders-tbody').innerHTML = '<tr><td colspan="7" class="text-center">Error loading orders.</td></tr>';
    }
}

async function loadCustomers() {
    // This function remains the same
    try {
        const response = await fetch(`${API_BASE}/admin/customers`);
        const customers = await response.json();
        const tbody = document.getElementById('customers-tbody');
        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No customers found.</td></tr>';
            return;
        }
        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${new Date(customer.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}


// --- NEW ORDER DETAILS LOGIC ---

async function openDetailsModal(orderId) {
    const modal = document.getElementById('details-modal');
    const contentDiv = document.getElementById('order-details-content');
    modal.classList.remove('hidden');
    contentDiv.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading order details...</p></div>';

    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`);
        if (!response.ok) throw new Error('Order not found');
        const order = await response.json();

        contentDiv.innerHTML = `
            <div class="order-detail-grid">
                <div><strong>Order ID:</strong> ${order.orderId}</div>
                <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
                <div><strong>Customer:</strong> ${order.userName} (${order.userEmail})</div>
                <div><strong>Status:</strong> <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></div>
            </div>
            <hr>
            <h4>Items Ordered</h4>
            <div class="order-items-list">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" class="order-item-image">
                        <div class="order-item-details">
                            <p class="order-item-name">${item.name}</p>
                            <p class="order-item-price">Price: $${item.price.toFixed(2)}</p>
                            <p class="order-item-qty">Quantity: ${item.quantity}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <hr>
            <div class="order-summary-details">
                <div><strong>Payment Method:</strong> ${order.paymentMethod}</div>
                <div class="total"><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</div>
            </div>
        `;

    } catch (error) {
        contentDiv.innerHTML = '<p class="error-message">Could not load order details.</p>';
        console.error('Error fetching order details:', error);
    }
}


// --- EXISTING MODAL AND ORDER MANAGEMENT LOGIC ---

function openStatusModal(orderId, displayOrderId, currentStatus) {
    document.getElementById('order-to-update-id').value = orderId;
    document.getElementById('modal-order-id').textContent = displayOrderId;
    document.getElementById('order-status-select').value = currentStatus;
    document.getElementById('status-modal').classList.remove('hidden');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
}

async function handleStatusUpdate(e) {
    // This function remains the same
    e.preventDefault();
    const orderId = document.getElementById('order-to-update-id').value;
    const newStatus = document.getElementById('order-status-select').value;
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) throw new Error('Failed to update status');
        alert('Order status updated successfully!');
        closeModal();
        loadOrders();
    } catch (error) {
        console.error('Error updating status:', error);
        alert(`Error: ${error.message}`);
    }
}

// --- OTHER FUNCTIONS (logout, add product, etc.) ---
// These remain the same as before

function adminLogout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('currentAdmin');
        window.location.href = 'login.html';
    }
}

async function handleAddProduct(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData.entries());
    productData.price = parseFloat(productData.price);
    productData.stock = parseInt(productData.stock);

    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        const result = await response.json();
        if (response.ok) {
            alert('Product added successfully!');
            e.target.reset();
            loadStats();
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        alert('Network error. Could not add product.');
    }
}
