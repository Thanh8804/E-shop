const { Category } = require('../models/category');
const { Product } = require('../models/product'); // Import the Product model from the models directory
const express = require('express'); // Import Express.js framework
const router = express.Router(); // Create a new router instance
const mongoose = require('mongoose'); // Create a new router instance

router.get(`/`, async (req, res) => {
    let filter = {};
    if(req.query.category)
    {
        filter = {category: req.query.category.split(',')}
    }

    const productList = await Product.find(filter).populate('category');
    if (!productList) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send(productList);
});

router.get(`/get/count`, async (req, res) => {
    const countProduct = await Product.countDocuments((count) => count)

    if (!countProduct) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send({
        count : countProduct
    });
});

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({isFeatured: true}).limit(+count) //+count để chuyển nó thành số

    if (!products) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send(products);
});

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category'); // Find all products in the database

    if (!product) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send(product);
});

router.post(`/`, async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category)
        return res.status(400).send('Invalid Category')

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })
    product = await product.save();

    if (!product)
        return res.status(500).send('The product cannot be created');

    res.send(product)
});

router.put('/:id', async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category);
    if (!category)
        return res.status(400).send('Invalid Category')
    const product = await Product.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    )
    if (!product)
        return res.status(404).send('the product cannot be updated!')

    res.send(product)
})

router.delete('/:id', (req,res)=>{
    Product.findByIdAndRemove(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({success: true, message: "the product is deleted!"})
        }
        else{
            return res.status(404).json({success: false, message: "product not found!"})
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err})
    })
})


module.exports = router; // Export the router to be used in other parts of the application