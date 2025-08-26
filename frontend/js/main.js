let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const API_BASE = 'http://localhost:5000/api';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    updateCartCount();
    loadProducts();
    setupEventListeners();
    setupSmoothScroll(); // Added for smooth scrolling
});

// --- AUTH & UI ---
function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        currentUser = user;
        updateUserInterface();
    }
}

function updateUserInterface() {
    const userNameElement = document.getElementById('user-name');
    const userActions = document.getElementById('user-actions');
    const userProfile = document.getElementById('user-profile');
    
    if (currentUser) {
        if (userNameElement) {
            userNameElement.textContent = `Hello, ${currentUser.name}!`;
        }
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
    updateUserInterface();
    showNotification('Logged out successfully', 'success');
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    searchBtn?.addEventListener('click', handleSearch);
    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

// --- PRODUCT LOADING & DISPLAY ---
async function loadProducts(query = '') {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading products...</p></div>';

    let url;
    // If there's a search query, use the search URL
    if (query) {
        url = `${API_BASE}/products/search/${encodeURIComponent(query)}`;
    } else {
        // If there's NO search query (i.e., on initial page load), get all products
        url = `${API_BASE}/products`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products.');
        
        let products = await response.json();

        // --- THIS IS THE CRUCIAL FIX ---
        // If there was no search query, filter to show ONLY featured products
        if (!query) {
            products = products.filter(product => product.featured === true);
        }
        // -----------------------------
        
        displayProducts(products);

    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p class="error-message" style="grid-column: 1 / -1; text-align: center;">Could not load products.</p>';
    }
}

function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-products" style="grid-column: 1 / -1; text-align: center;">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>No products found</h3>
                <p>Try a different search or category.</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            
            <!-- This wrapper is essential for the alignment fix -->
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">₹${parseFloat(product.price).toFixed(2)}</div>
            </div>

            <!-- This wrapper contains the button -->
            <div class="product-actions">
                <button onclick="addToCart('${product.id}')" class="btn btn-success">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}


// --- SEARCH & CATEGORY LOGIC ---
function handleSearch() {
    const query = document.getElementById('search-input').value.trim();
    document.querySelector('.products-section .section-title').textContent = query ? `Search Results for "${query}"` : 'Featured Products';
    loadProducts(query);
}

// This function is called by the `onclick` attribute in index.html
function searchByCategory(category) {
    document.getElementById('search-input').value = ''; // Clear search bar for clarity
    document.querySelector('.products-section .section-title').textContent = `Products in: ${category}`;
    loadProducts(category); // Directly load products for that category
    // Scroll to the products section smoothly
    document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
}

// --- CART LOGIC ---
async function addToCart(productId) {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`);
        if (!response.ok) throw new Error('Product not found');
        
        const product = await response.json();
        
        const existingItem = cart.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification(`${product.name} added to cart!`, 'success');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding product to cart.', 'error');
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
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

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}
