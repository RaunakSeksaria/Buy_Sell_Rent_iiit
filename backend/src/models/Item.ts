import mongoose, { Document, Schema } from 'mongoose';

interface IItem extends Document {
  userId: string;
  itemName: string;
  description: string;
  price: number;
  category: string;
}

const ItemSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
}, {
  timestamps: true,
});

const Item = mongoose.model<IItem>('Item', ItemSchema);

export default Item;
