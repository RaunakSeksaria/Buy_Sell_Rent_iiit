// src/routes/userRoutes.ts

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import authMiddleware from '../middleware/authMiddleware';

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

export default router;