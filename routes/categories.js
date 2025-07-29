const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated id
 *         name:
 *           type: string
 *           description: Category name
 *         icon:
 *           type: string
 *           description: Category icon
 *         color:
 *           type: string
 *           description: Category color
 */

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(categoryList);
})

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 */
router.get('/:id', async (req, res) =>{
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(500).json({message: 'The caterogy with the given ID was not found'})
    } 
    res.status(200).send(category);
})

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */
router.put('/:id', async(req, res)=>{
    const category = await Category.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        { new: true}
    )
    if(!category)
    return res.status(404).send('the caterogy cannot be updated!')

    res.send(category)
})

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', async(req,res)=>{
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })

    category = await category.save();
    if(!category)
    return res.status(404).send('the caterogy cannot be created!')

    res.send(category);
})

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
router.delete('/:id', (req,res)=>{
    Category.findByIdAndRemove(req.params.id).then(category=>{
        if(category){
            return res.status(200).json({success: true, message: "the category is deleted!"})
        }
        else{
            return res.status(404).json({success: false, message: "category not found!"})
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err})
    })
})

module.exports =router;