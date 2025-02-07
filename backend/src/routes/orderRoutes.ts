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

    res.status(201).json({ message: 'Order created successfully', order: newOrder });
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

    const orders = await Order.find({ buyer: userId }).populate('seller', 'firstName lastName').populate('buyer', 'firstName lastName');
    res.json(orders);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching orders' });
  }
});

export default router;