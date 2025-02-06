import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db";
import itemRoutes from "./routes/itemRoutes";
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes';
import orderRoutes from './routes/orderRoutes';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
// app.use("/api/items", itemRoutes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!);

// Use the routes
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
