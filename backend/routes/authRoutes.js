const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// File paths
const usersFile = path.join(__dirname, '..', 'data', 'users.json');
const adminFile = path.join(__dirname, '..', 'data', 'admin.json');

// Helper functions
const readUsersFile = () => {
    try {
        const data = fs.readFileSync(usersFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeUsersFile = (users) => {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

const readAdminFile = () => {
    try {
        const data = fs.readFileSync(adminFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// User Registration
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const users = readUsersFile();
    
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
    }

    const newUser = {
        id: uuidv4(),
        name,
        email,
        password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeUsersFile(users);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword
    });
});

// User Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = readUsersFile();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
        message: 'Login successful',
        user: userWithoutPassword
    });
});

// Admin Login
router.post('/admin/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const admins = readAdminFile();
    const admin = admins.find(a => a.email === email && a.password === password);

    if (!admin) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const { password: _, ...adminWithoutPassword } = admin;
    res.json({
        message: 'Admin login successful',
        admin: adminWithoutPassword
    });
});

module.exports = router;