import mongoose, { Document, Schema } from 'mongoose';

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  // Add other fields as needed
}

interface IItem extends Document {
  userId: IUser; // Change userId to IUser
  itemName: string;
  description: string;
  price: number;
  category: string;
  quantity: number; // Add quantity field
}

const ItemSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  }, // Add quantity field to schema
}, {
  timestamps: true,
});

const Item = mongoose.model<IItem>('Item', ItemSchema);

export default Item;