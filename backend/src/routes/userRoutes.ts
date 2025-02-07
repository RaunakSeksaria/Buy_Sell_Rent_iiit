// src/routes/userRoutes.ts

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import authMiddleware from '../middleware/authMiddleware';
import Item from '../models/Item';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, age, contactNumber, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      age,
      contactNumber,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error registering user' });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate a JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
      res.json({ token, message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Error logging in' });
  }
});

// Get user profile (protected route)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId; // Access userId set by middleware
    const user = await User.findById(userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching user profile' });
  }
});

// Edit user profile (protected route)
router.put('/editprofile', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId; // Access userId set by middleware
    const { firstName, lastName, email, age, contactNumber } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email, age, contactNumber },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: 'Error updating user profile' });
  }
});

// Add item to cart (protected route)
router.post('/cart', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId; // Access userId set by middleware
    const { itemId, quantity } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    // Check if the seller is different from the current user
    // console.log(item?.userId==userId);
    // console.log(item?.userId===userId);

    if (item?.userId == userId) {
      return res.status(400).json({ error: 'Cannot add your own item to the cart' });
    }

    // Check if the requested quantity is less than or equal to the available quantity
    if (quantity > item.quantity) {
      return res.status(400).json({ error: 'Requested quantity exceeds available quantity' });
    }
    
    const itemIndex = user.itemsInCart.findIndex((cartItem) => cartItem.item && cartItem.item.toString() === itemId);
    if (itemIndex > -1) {
      // Item already in cart, update quantity
      if (quantity +user.itemsInCart[itemIndex].quantity > item.quantity) {
        return res.status(400).json({ error: 'Requested quantity exceeds available quantity' });
      }
      user.itemsInCart[itemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      user.itemsInCart.push({ item: itemId, quantity });
    }

    await user.save();
    res.status(200).json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(400).json({ error: 'Error adding item to cart' });
  }
});

// Get cart items (protected route)
router.get('/cart', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId; // Access userId set by middleware
    const user = await User.findById(userId).populate('itemsInCart.item');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ itemsInCart: user.itemsInCart });
  } catch (error) {
    res.status(400).json({ error: 'Error fetching cart items' });
  }
});

// Update item quantity in cart (protected route)
router.put('/cart', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId; // Access userId set by middleware
    const { itemId, quantity } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const itemIndex = user.itemsInCart.findIndex((cartItem) => cartItem.item && cartItem.item.toString() === itemId);
    if (itemIndex > -1) {
      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      // Check if the updated quantity is less than the actual quantity in the items collection
      if (quantity <= item.quantity) {
        // Update item quantity
        user.itemsInCart[itemIndex].quantity = quantity;
        await user.save();
        res.status(200).json({ message: 'Item quantity updated' });
      } else {
        res.status(400).json({ error: 'Updated quantity must be less than the available quantity' });
      }
    } else {
      res.status(404).json({ error: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Error updating item quantity in cart' });
  }
});


// Delete item from cart (protected route)
router.delete('/cart', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId; // Access userId set by middleware
    const { itemId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const itemIndex = user.itemsInCart.findIndex((cartItem) => cartItem.item && cartItem.item.toString() === itemId);
    if (itemIndex > -1) {
      // Remove item from cart
      user.itemsInCart.splice(itemIndex, 1);
      await user.save();
      res.status(200).json({ message: 'Item removed from cart' });
    } else {
      res.status(404).json({ error: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Error removing item from cart' });
  }
});

export default router;