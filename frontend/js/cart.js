// --- GLOBAL VARIABLES ---
const API_BASE = 'http://localhost:5000/api';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    displayCart();
    setupEventListeners();
});

// --- AUTH & UI ---
function checkAuthStatus() {
    const userNameElement = document.getElementById('user-name');
    const userActions = document.getElementById('user-actions');
    const userProfile = document.getElementById('user-profile');
    
    if (currentUser) {
        if (userNameElement) userNameElement.textContent = `Hello, ${currentUser.name}!`;
        if (userActions) userActions.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');
    } else {
        if (userActions) userActions.classList.remove('hidden');
        if (userProfile) userProfile.classList.add('hidden');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.reload();
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('checkout-btn')?.addEventListener('click', openCheckoutModal);
    document.getElementById('checkout-form')?.addEventListener('submit', handleCheckout);
    document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach(btn => btn.addEventListener('click', closeAllModals));
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => radio.addEventListener('change', handlePaymentMethodChange));
}

// --- CART DISPLAY & MANAGEMENT ---
function displayCart() {
    const container = document.getElementById('cart-items-container');
    const summary = document.getElementById('cart-summary');
    
    if (!container || !summary) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart" style="text-align: center; grid-column: 1 / -1; padding: 40px 0;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc;"></i>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added anything yet.</p>
                <a href="../../index.html" class="btn btn-primary" style="margin-top: 1rem;">Start Shopping</a>
            </div>`;
        summary.classList.add('hidden');
        return;
    }
    
    summary.classList.remove('hidden');
    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity - 1})">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${index}, ${item.quantity + 1})">+</button>
            </div>
            <div class="cart-item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
            <button class="btn btn-danger remove-item" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    updateCartSummary();
}

function updateCartSummary() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal;
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `₹${total.toFixed(2)}`;
    
    const qrAmountEl = document.getElementById('qr-amount');
    if (qrAmountEl) {
        qrAmountEl.textContent = `₹${total.toFixed(2)}`;
    }
}

function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(index);
        return;
    }
    cart[index].quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

// --- CHECKOUT & MODAL LOGIC ---
function openCheckoutModal() {
    if (cart.length === 0) {
        showNotification('Your cart is empty.', 'error');
        return;
    }
    
    if (currentUser) {
        document.getElementById('customer-name').value = currentUser.name || '';
        document.getElementById('customer-email').value = currentUser.email || '';
    }
    
    document.querySelector('input[name="paymentMethod"][value="COD"]').checked = true;
    document.getElementById('qr-code-display').classList.add('hidden');
    document.getElementById('screenshot-upload-section').classList.add('hidden');
    document.getElementById('payment-screenshot').required = false;

    document.getElementById('checkout-modal').classList.remove('hidden');
}

async function handleCheckout(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const paymentMethod = formData.get('paymentMethod');
    const fileInput = document.getElementById('payment-screenshot');

    if (paymentMethod === 'UPI' && fileInput.files.length === 0) {
        showNotification('Please upload a payment screenshot to continue.', 'error');
        return;
    }

    const orderData = {
        userId: currentUser?.id || null,
        userName: formData.get('customerName'),
        userEmail: formData.get('customerEmail'),
        shippingAddress: { address: formData.get('shippingAddress') },
        paymentMethod: paymentMethod,
        items: cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
    };

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const result = await response.json();
        
        if (!response.ok) throw new Error(result.error || 'Order failed');

        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        closeAllModals();
        showSuccessModal(result.order);

    } catch (error) {
        console.error('Checkout error:', error);
        showNotification(error.message, 'error');
    }
}

function showSuccessModal(order) {
    document.getElementById('order-id').textContent = order.orderId;
    document.getElementById('order-total').textContent = `₹${order.totalAmount.toFixed(2)}`;
    document.getElementById('order-payment-method').textContent = order.paymentMethod;
    document.getElementById('success-modal').classList.remove('hidden');
}

function handlePaymentMethodChange(event) {
    const qrDisplay = document.getElementById('qr-code-display');
    const uploadSection = document.getElementById('screenshot-upload-section');
    const fileInput = document.getElementById('payment-screenshot');

    if (event.target.value === 'UPI') {
        qrDisplay.classList.remove('hidden');
        uploadSection.classList.remove('hidden');
        fileInput.required = true;
        generateDynamicQRCode();
    } else {
        qrDisplay.classList.add('hidden');
        uploadSection.classList.add('hidden');
        fileInput.required = false;
        fileInput.value = '';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
}

// --- DYNAMIC QR CODE GENERATION ---
function generateDynamicQRCode() {
    const qrImageContainer = document.getElementById('qr-code-image');
    qrImageContainer.innerHTML = `<div class="loading-spinner small"><i class="fas fa-spinner fa-spin"></i><p>Generating QR Code...</p></div>`;

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    const upiDetails = new URLSearchParams({
        pa: 'yashwanthrathi@fam',
        pn: 'YASHWANTH RATHI',
        am: totalAmount,
        cu: 'INR',
        tn: 'Order payment for E-Store'
    }).toString();

    const fullUpiString = `upi://pay?${upiDetails}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(fullUpiString)}`;

    const qrImage = new Image();
    qrImage.src = qrApiUrl;
    qrImage.onload = () => {
        qrImageContainer.innerHTML = '';
        qrImageContainer.appendChild(qrImage);
    };
    qrImage.onerror = () => {
        qrImageContainer.innerHTML = '<p class="error-message">Could not generate QR code.</p>';
    };
}

// --- UTILITY FUNCTIONS ---
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    notification.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}
