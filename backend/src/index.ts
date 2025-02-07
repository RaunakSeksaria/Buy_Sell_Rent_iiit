import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db";
import itemRoutes from "./routes/itemRoutes";
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes';
import orderRoutes from './routes/orderRoutes';
import jwt from 'jsonwebtoken';
import chatbotRoutes from './routes/chatbotRoutes';

declare module 'express-session' {
  interface SessionData {
    cas_user: string;
  }
}

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!);

let session = require("express-session");
let CASAuthentication = require("cas-authentication");

import User from './models/User';

app.use(session({
    secret: process.env.SECRET_CAS!,
    resave: false,
    saveUninitialized: true,
}));

// CAS Authentication
const cas = new CASAuthentication({
    cas_url: 'https://login.iiit.ac.in/cas',
    service_url: 'http://localhost:5000', // backend url
});

// Protected route
app.get("/cas", cas.bounce,async (req, res) => {
  try {
    const casUser = req.session.cas_user;
    
    // Check if user exists
    let user = await User.findOne({ email: casUser });

    if (!user) {
        // Create new user with default values
        user = await User.create({
            email: casUser,
            firstName: casUser ? casUser.split('@')[0] : 'defaultFirstName', // Default first name from email
            lastName: 'User', // Default last name
            age: 18, // Default age
            contactNumber: '0000000000', // Default contact
            password: Math.random().toString(36).slice(-8), // Random password
            itemsInCart: [],
            sellerReviews: []
        });
    }

    // Generate JWT token (if you're using JWT)
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
    );

    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/login/?token=${token}`);

} catch (error) {
    console.error('CAS Authentication Error:', error);
    res.redirect('http://localhost:3000/login?error=Authentication failed');
}

});

app.get("/api/cas-logout", cas.logout);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

// Use the routes
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatbotRoutes);  // Fixed missing forward slash
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
