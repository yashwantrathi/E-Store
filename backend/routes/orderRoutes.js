const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const ordersFile = path.join(__dirname, '..', 'data', 'orders.json');
const productsFile = path.join(__dirname, '..', 'data', 'products.json');

const readOrdersFile = () => {
    try {
        const data = fs.readFileSync(ordersFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeOrdersFile = (orders) => {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
};

const readProductsFile = () => {
    try {
        const data = fs.readFileSync(productsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeProductsFile = (products) => {
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
};

// Create new order
router.post('/', (req, res) => {
    const { userId, userName, userEmail, items, shippingAddress, paymentMethod } = req.body;

    if (!userName || !userEmail || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Required order information is missing' });
    }

    const products = readProductsFile();
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
            return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
        }
        if (product.stock < item.quantity) {
            return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        }

        calculatedTotal += product.price * item.quantity;
        orderItems.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            image: product.image
        });

        product.stock -= item.quantity;
    }

    writeProductsFile(products);

    const orders = readOrdersFile();
    const newOrder = {
        id: uuidv4(),
        orderId: `ORD-${Date.now()}`,
        userId: userId || null,
        userName,
        userEmail,
        items: orderItems,
        shippingAddress: shippingAddress || {},
        paymentMethod: paymentMethod || 'COD',
        totalAmount: calculatedTotal,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    writeOrdersFile(orders);

    res.status(201).json({
        message: 'Order placed successfully',
        order: newOrder
    });
});

// Get orders by user email
router.get('/user/:email', (req, res) => {
    const orders = readOrdersFile();
    const userOrders = orders.filter(order => order.userEmail === req.params.email);
    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(userOrders);
});

// Get all orders
router.get('/', (req, res) => {
    const orders = readOrdersFile();
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
});

// Update order status
router.put('/:id/status', (req, res) => {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const orders = readOrdersFile();
    const orderIndex = orders.findIndex(o => o.id === req.params.id);

    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }

    orders[orderIndex].status = status;
    writeOrdersFile(orders);

    res.json({
        message: 'Order status updated successfully',
        order: orders[orderIndex]
    });
});
/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order by its unique ID
 * @access  Admin
 */
router.get('/:id', (req, res) => {
    const orders = readOrdersFile();
    // Find the order in the array that matches the ID from the URL
    const order = orders.find(o => o.id === req.params.id);

    if (order) {
        // If the order is found, send it back as JSON
        res.json(order);
    } else {
        // If no order is found, send a 404 "Not Found" error
        res.status(404).json({ message: 'Order not found' });
    }
});

module.exports = router;