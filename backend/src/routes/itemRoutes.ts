import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import Item from '../models/Item';

const router = express.Router();

// Create a new item (protected route)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { itemName, description, price, category } = req.body;
    const userId = (req as any).userId;

    if (!itemName || !description || !price || !category) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newItem = new Item({
      userId,
      itemName,
      description,
      price,
      category,
    });

    await newItem.save();
    res.status(201).json({ 
      success: true,
      message: 'Item listed for sale successfully', 
      item: newItem 
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error listing item for sale' 
    });
  }
});
// Search items
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;
    
    // Build the query object
    let query: any = {};

    // Text search for item name or description
    if (q) {
      query.$or = [
        { itemName: new RegExp(q as string, 'i') },
        { description: new RegExp(q as string, 'i') }
      ];
    }

    // Category filter
    if (category) {
      query.category = new RegExp(category as string, 'i');
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const items = await Item.find(query);
    res.status(200).json({ 
      success: true,
      items,
      count: items.length,
      filters: {
        query: q || null,
        category: category || null,
        priceRange: {
          min: minPrice || null,
          max: maxPrice || null
        }
      }
    });
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error searching for items' 
    });
  }
});

// Get all items
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await Item.find();
    res.status(200).json({ 
      success: true,
      items,
      count: items.length 
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching items' 
    });
  }
});

// Get item by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    console.log(`Fetching item with ID: ${req.params.id}`);
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid item ID format' 
      });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ 
        success: false,
        error: 'Item not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      item 
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

export default router;