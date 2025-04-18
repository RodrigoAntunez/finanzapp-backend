import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  whatsappNumber: string;
  name: string; // Corregido de { type: String } a string
  messageCount: number;
  expenses: Types.ObjectId[];
  shoppingLists: Types.ObjectId[];
  subscriptionStatus: string;
  accessToken?: string;
  subscriptionId?: string;
  reminders: Types.ObjectId[];
  trialEndDate?: Date | null;
}

const userSchema = new Schema<IUser>({
  whatsappNumber: { type: String, required: true, unique: true },
  name: { type: String, required: false }, // Esquema correcto
  messageCount: { type: Number, default: 0 },
  expenses: [{ type: Schema.Types.ObjectId, ref: "Expense" }],
  shoppingLists: [{ type: Schema.Types.ObjectId, ref: "ShoppingItem" }],
  reminders: [{ type: Schema.Types.ObjectId, ref: "Reminder" }],
  subscriptionStatus: { type: String, default: "inactive" },
  accessToken: { type: String, required: false },
  subscriptionId: { type: String, required: false },
  trialEndDate: { type: Date, required: false },
});

export const User = mongoose.model<IUser>("User", userSchema, "users");