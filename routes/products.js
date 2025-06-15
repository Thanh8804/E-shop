const {Product} = require('../models/product'); // Import the Product model from the models directory
const express = require('express'); // Import Express.js framework
const router = express.Router(); // Create a new router instance

router.get(`/`, async(req, res) => {
    const productList = await Product.find(); // Find all products in the database
    
    if (!productList) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send(productList);
});

router.post(`/`, (req, res) => {
    const product = new Product({
        name: req.body.name,
        image: req.body.image,
        countInStock: req.body.countInStock
    })
    product.save().then((createdProduct => {
        res.status(201).json(createdProduct); // Respond with the created product and status 201 (Created)
    })).catch((err) => {
        res.status(500).json({ 
            error: err,
            success: false
        }); // Respond with an error message if saving fails
    })
});

module.exports = router; // Export the router to be used in other parts of the application