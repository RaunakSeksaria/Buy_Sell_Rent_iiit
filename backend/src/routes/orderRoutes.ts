import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import authMiddleware from '../middleware/authMiddleware';
import Order from '../models/Order';
import User from '../models/User';
import Item from '../models/Item';

const router = express.Router();

// Create a new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('Received order request:', req.body);
    const userId = (req as any).userId; // Access userId set by middleware
    const { items } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Invalid items payload:', items);
      return res.status(400).json({ error: 'Invalid items array provided' });
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.item || !item.quantity) {
        console.log('Invalid item structure:', item);
        return res.status(400).json({ error: 'Each item must have item ID and quantity' });
      }
    }

    // Calculate total amount and validate items
    let totalAmount = 0;
    const itemDetails = [];
    for (const cartItem of items) {
      console.log('Processing item:', cartItem);
      const item = await Item.findById(cartItem.item).populate('userId', 'firstName lastName email');
      if (!item) {
        return res.status(404).json({ error: `Item with ID ${cartItem.item} not found` });
      }
      if (cartItem.quantity > item.quantity) {
        return res.status(400).json({ error: `Requested quantity for item ${item.itemName} exceeds available quantity` });
      }
      totalAmount += item.price * cartItem.quantity;
      itemDetails.push({ item, quantity: cartItem.quantity });
    }

    // Get buyer details
    const buyer = await User.findById(userId);
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    // Create a new order
    const transactionId = uuidv4();
    const hashedOTP = await bcrypt.hash(transactionId, 10); // Example of hashing the transaction ID as OTP

    const newOrder = new Order({
      transactionId,
      buyer: userId,
      seller: itemDetails[0].item.userId._id, // Assuming all items have the same seller
      items: itemDetails.map(detail => ({ item: detail.item._id, quantity: detail.quantity })),
      amount: totalAmount,
      hashedOTP,
      buyerDetails: {
        firstName: buyer.firstName,
        lastName: buyer.lastName,
        email: buyer.email,
      },
      sellerDetails: {
        firstName: itemDetails[0].item.userId.firstName,
        lastName: itemDetails[0].item.userId.lastName,
        email: itemDetails[0].item.userId.email,
      },
    });

    await newOrder.save();

    // Update item quantities
    for (const detail of itemDetails) {
      const item = await Item.findById(detail.item._id);
      if (item) {
        const newQuantity = item.quantity - detail.quantity;
        if (newQuantity < 0) {
          throw new Error(`Not enough stock for item ${item.itemName}`);
        }
        item.quantity = newQuantity;
        await item.save();
      }
    }

    // Send unhashed OTP (transactionId) to frontend
    res.status(201).json({ 
      message: 'Order created successfully', 
      orderId: newOrder._id,
      otp: transactionId  // Send the unhashed OTP
    });
  } catch (error) {
    console.error('Order creation error:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Invalid quantity values provided',
        details: error.message
      });
    }
    res.status(400).json({ 
      error: `Error creating order: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

// Get all orders for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId; // Access userId set by middleware

    const orders = await Order.find({ buyer: userId }).populate('seller', 'firstName lastName').populate('buyer', 'firstName lastName').populate('items.item');
    res.json(orders);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching orders' });
  }
});

// Verify OTP and complete order
router.post('/verify-otp', authMiddleware, async (req, res) => {
  try {
    const sellerId = (req as any).userId;
    const { orderId, otp } = req.body;

    if (!orderId || !otp) {
      return res.status(400).json({ error: 'Order ID and OTP are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify seller
    if (order.seller.toString() !== sellerId) {
      return res.status(403).json({ error: 'Unauthorized: Not the seller of this order' });
    }

    // Verify order status
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order is not in pending state' });
    }

    // Verify OTP
    const isValidOTP = await bcrypt.compare(otp, order.hashedOTP);
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid OTP provided' });
    }

    // Complete the order
    order.status = 'completed';
    await order.save();

    res.json({ 
      message: 'Order completed successfully',
      orderId: order._id
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(400).json({ 
      error: 'Error verifying OTP',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Regenerate OTP for an order
router.post('/regenerate-otp', authMiddleware, async (req, res) => {
  try {
    const buyerId = (req as any).userId;
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify buyer
    if (order.buyer.toString() !== buyerId) {
      return res.status(403).json({ error: 'Unauthorized: Not the buyer of this order' });
    }

    // Verify order status
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot regenerate OTP for non-pending orders' });
    }

    // Generate new OTP
    const newTransactionId = uuidv4();
    const newHashedOTP = await bcrypt.hash(newTransactionId, 10);

    // Update order with new OTP
    order.hashedOTP = newHashedOTP;
    await order.save();

    res.json({ 
      message: 'OTP regenerated successfully',
      otp: newTransactionId  // Send unhashed OTP
    });
  } catch (error) {
    console.error('OTP regeneration error:', error);
    res.status(400).json({ error: 'Error regenerating OTP' });
  }
});

export default router;