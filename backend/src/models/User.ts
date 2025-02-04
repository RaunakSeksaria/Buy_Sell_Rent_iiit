import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@(students\.|research\.)?iiit\.ac\.in$/,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  itemsInCart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
  ],
  sellerReviews: [
    {
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewText: String,
      rating: Number,
    },
  ],
}, {
  timestamps: true,
});

// Create and export the User model
const User = mongoose.model('User', userSchema);
export default User;
