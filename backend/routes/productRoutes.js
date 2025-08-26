const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const productsFile = path.join(__dirname, '..', 'data', 'products.json');

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

// Get all products
router.get('/', (req, res) => {
    const products = readProductsFile();
    res.json(products);
});

// Search products
// Search products by name, description, or category
router.get('/search/:query', (req, res) => {
    const products = readProductsFile();
    const query = req.params.query.toLowerCase().trim();

    if (!query) {
        return res.json(products); // Return all products if query is empty
    }

    const searchResults = products.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(query);
        const descriptionMatch = product.description.toLowerCase().includes(query);
        const categoryMatch = product.category.toLowerCase().includes(query);
        return nameMatch || descriptionMatch || categoryMatch;
    });

    res.json(searchResults);
});


// Get single product
router.get('/:id', (req, res) => {
    const products = readProductsFile();
    const product = products.find(p => p.id === req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// Add new product
router.post('/', (req, res) => {
    const { name, description, price, image, category, stock } = req.body;

    if (!name || !description || !price || !image || !category) {
        return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const products = readProductsFile();
    
    const newProduct = {
        id: (products.length + 1).toString(),
        name,
        description,
        price: parseFloat(price),
        image,
        category,
        stock: parseInt(stock) || 0,
        featured: false
    };

    products.push(newProduct);
    writeProductsFile(products);

    res.status(201).json({
        message: 'Product added successfully',
        product: newProduct
    });
});

module.exports = router;