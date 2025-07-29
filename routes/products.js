const { Category } = require('../models/category');
const { Product } = require('../models/product'); // Import the Product model from the models directory
const express = require('express'); // Import Express.js framework
const router = express.Router(); // Create a new router instance
const mongoose = require('mongoose'); // Create a new router instance
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('Invalid image type');

    if (isValid){
        uploadError = null
    }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const fieldName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype]; 
    cb(null, `${fieldName}-${Date.now()}.${extension}`)
  }
})

const uploadOptions = multer({ storage: storage })

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - category
 *         - countInStock
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated product ID
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Product description
 *         richDescription:
 *           type: string
 *           description: Rich HTML description
 *         image:
 *           type: string
 *           description: Main product image URL
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Gallery images URLs
 *         brand:
 *           type: string
 *           description: Product brand
 *         price:
 *           type: number
 *           description: Product price
 *         category:
 *           type: string
 *           description: Category ID reference
 *         countInStock:
 *           type: number
 *           description: Available quantity in stock
 *         rating:
 *           type: number
 *           description: Product rating (0-5)
 *         numReviews:
 *           type: number
 *           description: Number of reviews
 *         isFeatured:
 *           type: boolean
 *           description: Is product featured
 *         dateCreated:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *     ProductCount:
 *       type: object
 *       properties:
 *         count:
 *           type: number
 *           description: Total number of products
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         error:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with optional category filtering
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category IDs (comma separated)
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8,64a7b8c9d1e2f3a4b5c6d7e9"
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /products/get/count:
 *   get:
 *     summary: Get total count of products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Product count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductCount'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /products/get/featured/{count}:
 *   get:
 *     summary: Get featured products with limit
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: count
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Maximum number of featured products to return
 *         example: 5
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       500:
 *         description: Product not found or server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category'); // Find all products in the database

    if (!product) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send(product);
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create new product with image upload
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - category
 *               - countInStock
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *                 example: "iPhone 14 Pro"
 *               description:
 *                 type: string
 *                 description: Product description
 *                 example: "Latest iPhone with advanced camera system"
 *               richDescription:
 *                 type: string
 *                 description: Rich HTML description
 *                 example: "<p>iPhone 14 Pro with <strong>48MP camera</strong></p>"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Main product image (PNG, JPEG, JPG)
 *               brand:
 *                 type: string
 *                 description: Product brand
 *                 example: "Apple"
 *               price:
 *                 type: number
 *                 description: Product price
 *                 example: 999.99
 *               category:
 *                 type: string
 *                 description: Category ID
 *                 example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *               countInStock:
 *                 type: number
 *                 description: Available quantity
 *                 example: 100
 *               rating:
 *                 type: number
 *                 description: Product rating (0-5)
 *                 example: 4.5
 *               numReviews:
 *                 type: number
 *                 description: Number of reviews
 *                 example: 256
 *               isFeatured:
 *                 type: boolean
 *                 description: Is product featured
 *                 example: true
 *     responses:
 *       200:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - Invalid category or no image provided
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Invalid Category"
 *       500:
 *         description: Server error - Product cannot be created
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "The product cannot be created"
 */
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category)
        return res.status(400).send('Invalid Category')
    
    const file = req.file;
    if(!file) return res.status(400).send("No image in the request")

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
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

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update existing product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to update
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *                 example: "iPhone 14 Pro Max"
 *               description:
 *                 type: string
 *                 description: Product description
 *                 example: "Latest iPhone with larger screen"
 *               richDescription:
 *                 type: string
 *                 description: Rich HTML description
 *               image:
 *                 type: string
 *                 description: Main product image URL
 *                 example: "http://localhost:3000/public/uploads/iphone-14-pro.jpg"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Gallery images URLs
 *               brand:
 *                 type: string
 *                 description: Product brand
 *                 example: "Apple"
 *               price:
 *                 type: number
 *                 description: Product price
 *                 example: 1099.99
 *               category:
 *                 type: string
 *                 description: Category ID
 *                 example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *               countInStock:
 *                 type: number
 *                 description: Available quantity
 *                 example: 50
 *               rating:
 *                 type: number
 *                 description: Product rating (0-5)
 *                 example: 4.7
 *               numReviews:
 *                 type: number
 *                 description: Number of reviews
 *                 example: 312
 *               isFeatured:
 *                 type: boolean
 *                 description: Is product featured
 *                 example: true
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - Invalid Product ID or Category
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Invalid Product Id"
 *       404:
 *         description: Product not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "the product cannot be updated!"
 */
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

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to delete
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "the product is deleted!"
 *       400:
 *         description: Bad request - Error during deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   description: Error details
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "product not found!"
 */
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

/**
 * @swagger
 * /products/gallery-images/{id}:
 *   put:
 *     summary: Update product gallery images
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to update gallery
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Gallery images (max 10 files, PNG/JPEG/JPG only)
 *                 maxItems: 10
 *     responses:
 *       200:
 *         description: Gallery updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid Product ID
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Invalid Product Id"
 *       500:
 *         description: Gallery cannot be updated
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "the gallery cannot be updated!"
 */
router.put(
    '/gallery-images/:id', 
    uploadOptions.array('images', 10), 
    async (req, res)=> {
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
         }
         const files = req.files
         let imagesPaths = [];
         const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

         if(files) {
            files.map(file =>{
                imagesPaths.push(`${basePath}${file.filename}`);
            })
         }

         const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            { new: true}
        )

        if(!product)
            return res.status(500).send('the gallery cannot be updated!')

        res.send(product);
    }
)


module.exports = router; // Export the router to be used in other parts of the application