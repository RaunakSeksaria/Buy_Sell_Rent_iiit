// src/models/Order.ts

import mongoose from 'mongoose';

// Define the order schema
const orderSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  hashedOTP: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Create and export the Order model
const Order = mongoose.model('Order', orderSchema);
export default Order;
