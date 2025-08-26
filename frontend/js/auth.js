const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    setupAuthForms();
    checkIfAlreadyLoggedIn();
});

function checkIfAlreadyLoggedIn() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        window.location.href = '../../index.html';
    }
}

function setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        showFormError('Please fill in all fields');
        return;
    }

    if (!validateEmail(email)) {
        showFormError('Please enter a valid email address');
        return;
    }

    try {
        showLoading(true);
        clearFormError();

        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            showFormSuccess('Login successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 1500);
        } else {
            showFormError(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showFormError('Network error. Please check your connection and try again.');
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');

    if (!name || !email || !password || !confirmPassword) {
        showFormError('Please fill in all fields');
        return;
    }

    if (name.length < 2) {
        showFormError('Name must be at least 2 characters long');
        return;
    }

    if (!validateEmail(email)) {
        showFormError('Please enter a valid email address');
        return;
    }

    if (password.length < 6) {
        showFormError('Password must be at least 6 characters long');
        return;
    }

    if (password !== confirmPassword) {
        showFormError('Passwords do not match');
        return;
    }

    try {
        showLoading(true);
        clearFormError();

        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            showFormSuccess('Registration successful! Welcome to E-Store. Redirecting...');
            
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 2000);
        } else {
            showFormError(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showFormError('Network error. Please check your connection and try again.');
    } finally {
        showLoading(false);
    }
}

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
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    
    submitButtons.forEach(button => {
        if (show) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';
        } else {
            button.disabled = false;
            if (button.form && button.form.id === 'login-form') {
                button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            } else if (button.form && button.form.id === 'register-form') {
                button.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
            }
        }
    });
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}