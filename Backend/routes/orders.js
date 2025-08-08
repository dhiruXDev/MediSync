import express from 'express';
import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import auth from '../middlewares/auth.js';
import roles from '../middlewares/roles.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { 
    sendOrderConfirmationEmail, 
    sendOrderStatusUpdateEmail, 
    sendOrderCancellationEmail,
    sendOrderDeliveredEmail 
} from '../utils/emailService.js';
const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create new order
router.post('/', auth, async (req, res) => {
    try {
        const { items, deliveryAddress, paymentMethod = 'razorpay' } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }
        
        if (!deliveryAddress) {
            return res.status(400).json({ message: 'Delivery address is required' });
        }
        
        // Calculate total and validate items
        let totalAmount = 0;
        const orderItems = [];
        
        for (const item of items) {
            const medicine = await Medicine.findById(item.medicineId);
            if (!medicine) {
                return res.status(404).json({ message: `Medicine ${item.medicineId} not found` });
            }
            
            if (medicine.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${medicine.name}` });
            }
            
            const itemTotal = medicine.price * item.quantity;
            totalAmount += itemTotal;
            
            orderItems.push({
                medicineId: medicine._id,
                quantity: item.quantity,
                price: medicine.price,
                sellerId: medicine.sellerId
            });
        }
        
        // Create order
        const order = new Order({
            userId: req.user.userId,
            items: orderItems,
            totalAmount,
            deliveryAddress,
            paymentMethod
        });
        
        await order.save();
        
        // Create Razorpay order if payment method is razorpay
        let razorpayOrder = null;
        if (paymentMethod === 'razorpay') {
            razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100), // Convert to paise
                currency: 'INR',
                receipt: `order_${order._id}`,
                notes: {
                    orderId: order._id.toString()
                }
            });
            
            order.razorpayOrderId = razorpayOrder.id;
            await order.save();
        }
        
        // Send order confirmation email and create notification
        try {
            const user = await User.findById(req.user.userId);
            if (user) {
                await sendOrderConfirmationEmail(order, user);
                
                // Create notification for order creation
                const notification = new Notification({
                    userId: req.user.userId,
                    type: 'order_created',
                    message: `Your order #${order._id.toString().slice(-6)} has been placed successfully!`,
                    link: `/my-orders`,
                    meta: {
                        orderId: order._id,
                        orderNumber: order._id.toString().slice(-6),
                        totalAmount: order.totalAmount
                    }
                });
                await notification.save();
            }
        } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
        }
        
        res.status(201).json({
            message: 'Order created successfully',
            order,
            razorpayOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId })
            .populate('items.medicineId')
            .populate('items.sellerId', 'username')
            .sort({ createdAt: -1 });
            
        res.json({ orders });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
    try {
        console.log(first)
        const order = await Order.findById(req.params.id)
            .populate('items.medicineId')
            .populate('items.sellerId', 'username')
            .populate('userId', 'username email');
           
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Check if user is authorized to view this order
        if (order.userId._id.toString() !== req.user.userId && req.user.role !== 'seller' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }
        
        res.json({ order });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

 
// Update order status (seller only - for their items)
router.put('/:id/status', auth, roles(['seller']), async (req, res) => {
    try {
        const { status, deliveryStatus, trackingNumber } = req.body;
        console.log("Delevery",trackingNumber)
        const order = await Order.findById(req.params.id);
         if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
          
        // Check if seller has items in this order
        const sellerItems = order.items.filter(item => 
            item.sellerId.toString() === req.user.userId
        );
        
        if (sellerItems.length === 0) {
            return res.status(403).json({ message: 'No items in this order belong to you' });
        }
        
        // Update order status
        if (status) {
            order.status = status;
            order. paymentStatus = status === 'delivered' || 'confirmed' ? 'completed' :'pending'; 
        }
        
        if (deliveryStatus) {
            order.deliveryStatus = status;
        }
        
        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }
        
        await order.save();
        
        // Create notification for status change
        try {
            const user = await User.findById(order.userId);
            if (user && (status || deliveryStatus)) {
                const newStatus = status || deliveryStatus;
                const statusMessages = {
                    'confirmed': 'Your order has been confirmed and is being processed!',
                    'processing': 'Your order is now being processed and prepared for shipping.',
                    'shipped': 'Your order has been shipped and is on its way to you!',
                    'delivered': 'Your order has been delivered successfully!',
                    'cancelled': 'Your order has been cancelled.'
                };
                
                const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`;
                
                // Create notification
                const notification = new Notification({
                    userId: order.userId,
                    type: 'order_status_update',
                    message: message,
                    link: `/my-orders`,
                    meta: {
                        orderId: order._id,
                        status: newStatus,
                        orderNumber:  order._id.toString().slice(-6)
                    }
                });
                await notification.save();
                
                // Send status update email
                await sendOrderStatusUpdateEmail(order, user, newStatus);
                
                // Send delivery completion email if status is delivered
                if (deliveryStatus === 'delivered') {
                    await sendOrderDeliveredEmail(order, user);
                }
            }
        } catch (emailError) {
            console.error('Error sending status update email:', emailError);
        }
        
        res.json({ 
            message: 'Order status updated successfully',
            order 
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Cancel order (customer only - before delivery)
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        if (order.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }
        
        if (order.deliveryStatus === 'delivered') {
            return res.status(400).json({ message: 'Cannot cancel delivered order' });
        }
        
        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Order is already cancelled' });
        }
        
        order.status = 'cancelled';
        order.deliveryStatus = 'cancelled';
        order.paymentStatus = order.paymentMethod == 'razorpay' ? 'refunded' :'No Payment Required';

        await order.save();
        
        // Send cancellation email and create notification
        try {
            const user = await User.findById(order.userId);
            if (user) {
                const reason = req.body.reason || 'Customer requested cancellation';
                await sendOrderCancellationEmail(order, user, reason);
                
                // Create notification for order cancellation
                const notification = new Notification({
                    userId: order.userId,
                    type: 'order_cancelled',
                    message: `Your order #${order._id.slice(-8)} has been cancelled.`,
                    link: `/my-orders`,
                    meta: {
                        orderId: order._id,
                        orderNumber: order._id.slice(-8),
                        reason: reason
                    }
                });
                await notification.save();
            }
        } catch (emailError) {
            console.error('Error sending cancellation email:', emailError);
        }
        
        res.json({ 
            message: 'Order cancelled successfully',
            order 
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get seller's orders (seller only)
router.get('/seller/my-orders', auth, roles(['seller']), async (req, res) => {
    try {
        const orders = await Order.find({
            'items.sellerId': req.user.userId
        })
        .populate('items.medicineId')
        .populate('userId', 'username email')
        .sort({ createdAt: -1 });
        
        res.json({ orders });
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify payment
router.post('/verify-payment', auth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        // Verify signature
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
     //   const crypto = require('crypto');
        const signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');
            
        if (signature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }
        
        // Update order payment status
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        order.paymentStatus = 'completed';
        order.razorpayPaymentId = razorpay_payment_id;
        order.status = 'confirmed';
        
        await order.save();
        
        res.json({ 
            message: 'Payment verified successfully',
            order 
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all orders (admin only)
router.get('/admin/all', auth, roles(['admin']), async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('items.medicineId')
            .populate('items.sellerId', 'username')
            .populate('userId', 'username email')
            .sort({ createdAt: -1 });
            
        res.json({ orders });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router; 