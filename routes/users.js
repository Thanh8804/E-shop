const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated user ID
 *         name:
 *           type: string
 *           description: User full name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: "john@example.com"
 *         passwordHash:
 *           type: string
 *           description: Hashed password (not returned in responses)
 *         phone:
 *           type: string
 *           description: User phone number
 *           example: "+1234567890"
 *         isAdmin:
 *           type: boolean
 *           description: Admin privileges
 *           example: false
 *         street:
 *           type: string
 *           description: Street address
 *           example: "123 Main St"
 *         apartment:
 *           type: string
 *           description: Apartment number
 *           example: "Apt 4B"
 *         zip:
 *           type: string
 *           description: ZIP/Postal code
 *           example: "12345"
 *         city:
 *           type: string
 *           description: City name
 *           example: "New York"
 *         country:
 *           type: string
 *           description: Country name
 *           example: "USA"
 *         dateCreated:
 *           type: string
 *           format: date-time
 *           description: User creation date
 *     UserResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             passwordHash:
 *               type: string
 *               description: Password hash (excluded from responses)
 *               writeOnly: true
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           description: User password
 *           example: "password123"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           description: User email
 *           example: "john@example.com"
 *         token:
 *           type: string
 *           description: JWT authentication token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     UserCount:
 *       type: object
 *       properties:
 *         userCount:
 *           type: number
 *           description: Total number of users
 *           example: 150
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
 *   name: Users
 *   description: User management and authentication APIs
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       500:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "The category with the given ID was not found"
 */
router.get('/:id', async (req, res) =>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({message: 'The caterogy with the given ID was not found'})
    } 
    res.status(200).send(user);
})

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - passwordHash
 *             properties:
 *               name:
 *                 type: string
 *                 description: User full name
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "john@example.com"
 *               color:
 *                 type: string
 *                 description: User color preference
 *                 example: "#3498db"
 *               passwordHash:
 *                 type: string
 *                 description: User password (will be hashed)
 *                 example: "password123"
 *               phone:
 *                 type: string
 *                 description: User phone number
 *                 example: "+1234567890"
 *               isAdmin:
 *                 type: boolean
 *                 description: Admin privileges
 *                 example: false
 *               apartment:
 *                 type: string
 *                 description: Apartment number
 *                 example: "Apt 4B"
 *               zip:
 *                 type: string
 *                 description: ZIP/Postal code
 *                 example: "12345"
 *               city:
 *                 type: string
 *                 description: City name
 *                 example: "New York"
 *               country:
 *                 type: string
 *                 description: Country name
 *                 example: "USA"
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       404:
 *         description: User cannot be created
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "the user cannot be created!"
 */
router.post('/', async(req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        color: req.body.color,
        passwordHash: bcrypt.hashSync(req.body.passwordHash, 10), //10 là số vòng mã hóa 10 tức 2^10
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();
    if(!user)
    return res.status(404).send('the user cannot be created!')

    res.send(user);
})

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register new user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User full name
 *                 example: "Jane Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "jane@example.com"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "securepassword123"
 *               phone:
 *                 type: string
 *                 description: User phone number
 *                 example: "+1987654321"
 *               isAdmin:
 *                 type: boolean
 *                 description: Admin privileges (default false)
 *                 example: false
 *               street:
 *                 type: string
 *                 description: Street address
 *                 example: "456 Oak Avenue"
 *               apartment:
 *                 type: string
 *                 description: Apartment number
 *                 example: "Unit 2A"
 *               zip:
 *                 type: string
 *                 description: ZIP/Postal code
 *                 example: "54321"
 *               city:
 *                 type: string
 *                 description: City name
 *                 example: "Los Angeles"
 *               country:
 *                 type: string
 *                 description: Country name
 *                 example: "USA"
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Registration failed
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "the user cannot be created!"
 */
router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login authentication
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 user_not_found:
 *                   value: "The user not found"
 *                   summary: User email not found
 *                 wrong_password:
 *                   value: "password is wrong"
 *                   summary: Incorrect password
 */
router.post('/login', async(req,res) =>{
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!user) {
        return res.status(400).send('The user not found')
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1d'}
        )
        return res.status(200).send({ user: user.email, token: token });
    }else{
        return res.status(400).send('Password is wrong');
    }

    return res.status(200).send(user);
})

/**
 * @swagger
 * /users/get/count:
 *   get:
 *     summary: Get total count of users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserCount'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments((count) => count)

    if (!userCount) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send({
        userCount : userCount
    });
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: "the user is deleted!"
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
 *         description: User not found
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
 *                   example: "user not found!"
 */
router.delete('/:id', (req,res)=>{
    User.findByIdAndRemove(req.params.id).then(user=>{
        if(user){
            return res.status(200).json({success: true, message: "the user is deleted!"})
        }
        else{
            return res.status(404).json({success: false, message: "user not found!"})
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err})
    })
})
module.exports =router;