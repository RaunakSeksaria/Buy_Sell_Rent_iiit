import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import Item from '../models/Item';
import { Document } from 'mongoose';

const router = express.Router();

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  // Add other fields as needed
}

interface IItem extends Document {
  userId: IUser;
  itemName: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
}

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { itemName, description, price, category, quantity } = req.body;
    const userId = (req as any).userId;

    if (!itemName || !description || !price || !category || !quantity) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newItem = new Item({
      userId,
      itemName,
      description,
      price,
      category,
      quantity, // Include quantity
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

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, categories, minPrice, maxPrice, minQuantity, maxQuantity } = req.query;
    
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
    if (categories) {
      query.category = { $in: (categories as string).split(',').map(category => new RegExp(category, 'i')) };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Quantity range filter
    if (minQuantity || maxQuantity) {
      query.quantity = {};
      if (minQuantity) query.quantity.$gte = Number(minQuantity);
      if (maxQuantity) query.quantity.$lte = Number(maxQuantity);
    }

    const items = await Item.find(query).populate('userId', 'firstName lastName email') as IItem[];
    // console.log(items);
    // // Log the seller names
    // items.forEach(item => {
    //   console.log(`Seller Name: ${item.userId.firstName} ${item.userId.lastName}, Seller Email: ${item.userId.email}`);
    // });

    res.status(200).json({ 
      success: true,
      items,
      count: items.length,
      filters: {
        query: q || null,
        categories: categories || null,
        priceRange: {
          min: minPrice || null,
          max: maxPrice || null
        },
        quantityRange: {
          min: minQuantity || null,
          max: maxQuantity || null
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

router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    console.log(`Fetching item with ID: ${req.params.id}`);
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid item ID format' 
      });
    }

    const item = await Item.findById(req.params.id).populate('userId', 'firstName lastName email');
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