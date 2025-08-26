const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const usersFile = path.join(__dirname, '..', 'data', 'users.json');
const ordersFile = path.join(__dirname, '..', 'data', 'orders.json');
const productsFile = path.join(__dirname, '..', 'data', 'products.json');

const readUsersFile = () => {
    try {
        const data = fs.readFileSync(usersFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const readOrdersFile = () => {
    try {
        const data = fs.readFileSync(ordersFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const readProductsFile = () => {
    try {
        const data = fs.readFileSync(productsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Get dashboard statistics
router.get('/stats', (req, res) => {
    const users = readUsersFile();
    const orders = readOrdersFile();
    const products = readProductsFile();

    const totalUsers = users.length;
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

    res.json({
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
        recentOrders
    });
});

// Get all customers
router.get('/customers', (req, res) => {
    const users = readUsersFile();
    
    const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });

    res.json(safeUsers);
});

module.exports = router;