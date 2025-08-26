const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Check if the user is logged in. If not, redirect to the login page.
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    loadUserOrders(currentUser.email);
});

async function loadUserOrders(userEmail) {
    const container = document.getElementById('orders-container');
    
    try {
        const response = await fetch(`${API_BASE}/orders/user/${encodeURIComponent(userEmail)}`);

        if (!response.ok) {
            throw new Error('Failed to fetch orders.');
        }

        const orders = await response.json();

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-box-open"></i>
                    <h2>No orders found</h2>
                    <p>You haven't placed any orders yet. Let's change that!</p>
                    <a href="../../index.html" class="btn btn-primary">
                        <i class="fas fa-shopping-bag"></i> Start Shopping
                    </a>
                </div>
            `;
            return;
        }

        // If orders are found, display them
        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-header-info">
                        <div>
                            <strong>ORDER PLACED</strong>
                            ${new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                            <strong>TOTAL</strong>
                            $${order.totalAmount.toFixed(2)}
                        </div>
                        <div>
                            <strong>ORDER #</strong>
                            ${order.orderId}
                        </div>
                    </div>
                    <div class="order-status">
                        <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                </div>
                <div class="order-body">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.name}" class="order-item-image">
                            <div class="order-item-details">
                                <p class="order-item-name">${item.name}</p>
                                <p class="order-item-price">$${item.price.toFixed(2)}</p>
                                <p class="order-item-qty">Quantity: ${item.quantity}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error fetching orders:', error);
        container.innerHTML = `
            <div class="error-message">
                <h3>Could not load your orders.</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}
