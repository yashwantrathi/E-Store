const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    // If an admin is already logged in, redirect them straight to the dashboard.
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (currentAdmin) {
        window.location.href = 'dashboard.html';
        return; // Stop the script here
    }

    // Otherwise, set up the login form listener.
    const form = document.getElementById('admin-login-form');
    form.addEventListener('submit', handleAdminLogin);
});

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        showFormError('Please fill in all fields');
        return;
    }

    try {
        showLoading(true);
        clearFormError();

        const response = await fetch(`${API_BASE}/auth/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // SUCCESS! Store the admin data in localStorage.
            localStorage.setItem('currentAdmin', JSON.stringify(data.admin));
            
            showFormSuccess('Login successful! Redirecting to dashboard...');
            
            // **THIS IS THE FIX:** Redirect to the dashboard page after 1.5 seconds.
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } else {
            // Show the error message from the server.
            showFormError(data.error || 'Invalid admin credentials');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showFormError('Network error. Please try again.');
    } finally {
        showLoading(false);
    }
}

// --- Helper functions for UI feedback ---

function showFormError(message) {
    const errorElement = document.getElementById('form-error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function showFormSuccess(message) {
    clearFormError();
    
    let successElement = document.getElementById('form-success-message');
    if (!successElement) {
        successElement = document.createElement('div');
        successElement.id = 'form-success-message';
        successElement.className = 'form-success';
        
        const errorElement = document.getElementById('form-error-message');
        if (errorElement) {
            errorElement.parentNode.insertBefore(successElement, errorElement);
        }
    }
    
    successElement.textContent = message;
    successElement.classList.remove('hidden');
}

function clearFormError() {
    const errorElement = document.getElementById('form-error-message');
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

function showLoading(show) {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        if (show) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Access Dashboard';
        }
    }
}
