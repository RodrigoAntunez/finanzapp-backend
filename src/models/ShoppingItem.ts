// backend/src/models/ShoppingItem.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IShoppingItem extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  user: Types.ObjectId; // Añadimos user
  items: { name: string; purchased: boolean }[];
}

const shoppingItemSchema = new Schema<IShoppingItem>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Añadimos user
  items: [
    {
      name: { type: String, required: true },
      purchased: { type: Boolean, default: false },
    },
  ],
});

export const ShoppingItem = model<IShoppingItem>("ShoppingItem", shoppingItemSchema);