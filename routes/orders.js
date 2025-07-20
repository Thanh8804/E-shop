const { Order } = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 });

    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList);
})

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