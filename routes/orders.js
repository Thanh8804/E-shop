const { Order } = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - quantity
 *         - product
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated order item ID
 *         quantity:
 *           type: number
 *           description: Quantity of the product
 *           example: 2
 *         product:
 *           type: string
 *           description: Product ID reference
 *           example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     Order:
 *       type: object
 *       required:
 *         - orderItems
 *         - shippingAddress1
 *         - city
 *         - country
 *         - phone
 *         - user
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated order ID
 *         orderItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *           description: Array of order items
 *         shippingAddress1:
 *           type: string
 *           description: Primary shipping address
 *           example: "123 Main Street"
 *         shippingAddress2:
 *           type: string
 *           description: Secondary shipping address (optional)
 *           example: "Apartment 4B"
 *         city:
 *           type: string
 *           description: Shipping city
 *           example: "New York"
 *         zip:
 *           type: string
 *           description: ZIP/Postal code
 *           example: "10001"
 *         country:
 *           type: string
 *           description: Shipping country
 *           example: "USA"
 *         phone:
 *           type: string
 *           description: Contact phone number
 *           example: "+1234567890"
 *         status:
 *           type: string
 *           description: Order status
 *           enum: [Pending, Processing, Shipped, Delivered, Cancelled]
 *           example: "Pending"
 *         totalPrice:
 *           type: number
 *           description: Total order price (calculated automatically)
 *           example: 299.99
 *         user:
 *           type: string
 *           description: User ID who placed the order
 *           example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *         dateOrdered:
 *           type: string
 *           format: date-time
 *           description: Order creation date
 *     OrderRequest:
 *       type: object
 *       required:
 *         - orderItems
 *         - shippingAddress1
 *         - city
 *         - country
 *         - phone
 *         - user
 *       properties:
 *         orderItems:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 2
 *               product:
 *                 type: string
 *                 example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *         shippingAddress1:
 *           type: string
 *           example: "123 Main Street"
 *         shippingAddress2:
 *           type: string
 *           example: "Apartment 4B"
 *         city:
 *           type: string
 *           example: "New York"
 *         zip:
 *           type: string
 *           example: "10001"
 *         country:
 *           type: string
 *           example: "USA"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         status:
 *           type: string
 *           example: "Pending"
 *         user:
 *           type: string
 *           example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     OrderCount:
 *       type: object
 *       properties:
 *         count:
 *           type: number
 *           description: Total number of orders
 *           example: 245
 *     TotalSales:
 *       type: object
 *       properties:
 *         totalSales:
 *           type: number
 *           description: Total sales amount from all orders
 *           example: 15742.50
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
 *   name: Orders
 *   description: Order management APIs
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders retrieved successfully (sorted by date, newest first)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 */
router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 });

    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList);
})

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID with full details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     responses:
 *       200:
 *         description: Order details retrieved successfully with populated user, order items, products and categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       500:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 */
router.get(`/:id`, async (req, res) => {
    const orderList = await Order.findById(req.params.id)
        .populate('user')
        .populate({ // <-- Bắt đầu mở lớp búp bê đầu tiên
            path: 'orderItems', // 1. Mở Order, tìm đến trường 'orderItems'.
            //    Thay thế các ID trong mảng này bằng toàn bộ document OrderItem tương ứng.
            populate: { // <-- Sau khi lấy được OrderItem, tiếp tục mở lớp búp bê bên trong nó
                path: 'product', // 2. Bên trong mỗi OrderItem, tìm đến trường 'product'.
                //    Thay thế ID sản phẩm bằng toàn bộ document Product tương ứng.
                populate: 'category' // 3. Bên trong Product vừa lấy, tìm và thay thế ID của 'category'
                //    bằng document Category đầy đủ.
            }
        });;

    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList);
})

/**
 * @swagger
 * /orders/userorders/{userid}:
 *   get:
 *     summary: Get all orders for a specific user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get orders for
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     responses:
 *       200:
 *         description: User orders retrieved successfully (sorted by date, newest first)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 */
router.get(`/userorders/:userid`, async (req, res) => {
    // Tìm tất cả các đơn hàng có trường 'user' khớp với userid từ URL
    const userOrderList = await Order.find({user: req.params.userid})       
        .populate('user')
        .populate({ // <-- Bắt đầu mở lớp búp bê đầu tiên
            path: 'orderItems', // 1. Mở Order, tìm đến trường 'orderItems'.
            //    Thay thế các ID trong mảng này bằng toàn bộ document OrderItem tương ứng.
            populate: { // <-- Sau khi lấy được OrderItem, tiếp tục mở lớp búp bê bên trong nó
                path: 'product', // 2. Bên trong mỗi OrderItem, tìm đến trường 'product'.
                //    Thay thế ID sản phẩm bằng toàn bộ document Product tương ứng.
                populate: 'category' // 3. Bên trong Product vừa lấy, tìm và thay thế ID của 'category'
                //    bằng document Category đầy đủ.
            }
        }).sort({ 'dateOrdered': -1 })

    if (!userOrderList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrderList);
})

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderRequest'
 *           example:
 *             orderItems:
 *               - quantity: 2
 *                 product: "64a7b8c9d1e2f3a4b5c6d7e8"
 *               - quantity: 1
 *                 product: "64a7b8c9d1e2f3a4b5c6d7e9"
 *             shippingAddress1: "123 Main Street"
 *             shippingAddress2: "Apartment 4B"
 *             city: "New York"
 *             zip: "10001"
 *             country: "USA"
 *             phone: "+1234567890"
 *             status: "Pending"
 *             user: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     responses:
 *       200:
 *         description: Order created successfully (total price calculated automatically)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Order cannot be created
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "the order cannot be created!"
 */
router.post('/', async (req, res) => {
    const orderItemsIds = await Promise.all(
        req.body.orderItems.map(async orderItem => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            });

            newOrderItem = await newOrderItem.save();
            return newOrderItem._id;
        })
    );

    const totalPrices = await Promise.all(orderItemsIds.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
        const totalPrice = orderItem.product.price*orderItem.quantity
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
    console.log(totalPrice)

    let order = new Order({
        orderItems: orderItemsIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();

    if (!order)
        return res.status(400).send('the order cannot be created!')
    res.send(order)
})

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID to update
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 description: New order status
 *                 enum: [Pending, Processing, Shipped, Delivered, Cancelled]
 *                 example: "Processing"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found or cannot be updated
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "the order cannot be updated!"
 */
router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id,
        {    
            status: req.body.status
        },
        { new: true }
    )
    if (!order)
        return res.status(404).send('the order cannot be updated!')

    res.send(order)
})

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete order and all related order items
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID to delete
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     responses:
 *       200:
 *         description: Order and all related order items deleted successfully
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
 *                   example: "the order is deleted!"
 *       400:
 *         description: Error during deletion
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
 *         description: Order not found
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
 *                   example: "order not found!"
 */
router.delete('/:id', (req,res)=>{
    Order.findByIdAndRemove(req.params.id).then( async order=>{
        if (order) {
            // 2. Nếu đơn hàng tồn tại, xóa tất cả các orderItem liên quan
            await Promise.all(
                order.orderItems.map(async (orderItemId) => {
                    // Gọi phương thức trên Model OrderItem, truyền vào ID
                    const orderItem = await OrderItem.findByIdAndRemove(orderItemId);
                    if (!orderItem) {
                        // Có thể log ra lỗi nếu một orderItem nào đó không tìm thấy
                        console.log(`Could not find and delete orderItem: ${orderItemId}`);
                    }
                })
            );3
            return res.status(200).json({success: true, message: "the order is deleted!"})
        }
        else{
            return res.status(404).json({success: false, message: "order not found!"})
        }
    }).catch(err => {
        return res.status(400).json({success: false, error: err})
    })
})

/**
 * @swagger
 * /orders/get/totalsales:
 *   get:
 *     summary: Get total sales amount from all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total sales calculated successfully using aggregation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TotalSales'
 *       400:
 *         description: Cannot calculate total sales
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "The order sales cannot be generated"
 */
router.get('/get/totalsales', async (req,res) => {
    // Dùng Aggregation để gom tất cả đơn hàng thành một nhóm (_id: null) và tính tổng của trường 'totalPrice'.
    const totalSales = await Order.aggregate([
        { $group: {_id: null, totalsales: { $sum: '$totalPrice'}}}
    ])

    if(!totalSales){
        return res.status(400).send('The order sales cannot be generated')
    }
    // Pop the single result object from the array, get the 'totalsales' value, and send it.
    return res.send({totalSales: totalSales.pop().totalsales})
})

/**
 * @swagger
 * /orders/get/count:
 *   get:
 *     summary: Get total count of orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderCount'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 */
router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments((count) => count)

    if (!orderCount) {
        return res.status(500).json({
            success: false,
        })
    }
    res.send({
        count : orderCount
    });
});



module.exports = router;