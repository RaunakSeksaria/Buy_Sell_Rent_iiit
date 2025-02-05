// src/routes/orderRoutes.ts

import express, { Request, Response } from 'express';
import Order from '../models/Order';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Create a new order (protected route)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { transactionId, seller, amount, hashedOTP } = req.body;
    const buyer = (req as any).userId; // Get buyer ID from authenticated user

    const newOrder = new Order({
      transactionId,
      buyer,
      seller,
      amount,
      hashedOTP,
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    res.status(400).json({ error: 'Error creating order' });
  }
});

// Get all orders (protected route)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate('buyer', 'firstName lastName')
      .populate('seller', 'firstName lastName');
    res.json(orders);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching orders' });
  }
});

// Update an order (protected route)
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: 'Error updating order' });
  }
});

// Delete an order (protected route)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting order' });
  }
});

export default router;
