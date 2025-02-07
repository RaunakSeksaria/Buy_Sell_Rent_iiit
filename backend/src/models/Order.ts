import mongoose, { Document, Schema } from 'mongoose';

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  // Add other fields as needed
}

interface IItem {
  _id: string;
  itemName: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  // Add other fields as needed
}

interface IOrder extends Document {
  transactionId: string;
  buyer: IUser;
  seller: IUser;
  items: {
    item: IItem;
    quantity: number;
  }[];
  amount: number;
  hashedOTP: string;
  status: 'pending' | 'completed' | 'canceled';
}

const orderSchema: Schema = new Schema({
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
  items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  hashedOTP: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'canceled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// // Add indexes
// orderSchema.index({ buyer: 1 });
// orderSchema.index({ seller: 1 });
// orderSchema.index({ transactionId: 1 });

// Create and export the Order model
const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
