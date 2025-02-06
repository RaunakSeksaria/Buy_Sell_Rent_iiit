import express from 'express';
import authMiddleware from '../middleware/authMiddleware';
import Item from '../models/Item';

const router = express.Router();

// Create a new item (protected route)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { itemName, description, price, category } = req.body;
    const userId = (req as any).userId; // Access userId set by middleware

    const newItem = new Item({
      userId,
      itemName,
      description,
      price,
      category,
    });

    await newItem.save();
    res.status(201).json({ message: 'Item listed for sale successfully', item: newItem });
  } catch (error) {
    res.status(400).json({ error: 'Error listing item for sale' });
  }
});

export default router;