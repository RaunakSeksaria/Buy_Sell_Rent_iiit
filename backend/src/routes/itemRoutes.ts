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

// Search items
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const query = q ? { itemName: new RegExp(q as string, 'i') } : {};

    const items = await Item.find(query);
    res.status(200).json({ items });
  } catch (error) {
    res.status(400).json({ error: 'Error searching for items' });
  }
});

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json({ items });
  } catch (error) {
    res.status(400).json({ error: 'Error fetching items' });
  }
});

export default router;