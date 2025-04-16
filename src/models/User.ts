// backend/src/models/User.ts
import mongoose,{ Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  whatsappNumber: string;
  name?: string; // Añadimos name como opcional
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
  name: { type: String, required: false }, // Añadimos name
  messageCount: { type: Number, default: 0 },
  expenses: [{ type: Schema.Types.ObjectId, ref: "Expense" }],
  shoppingLists: [{ type: Schema.Types.ObjectId, ref: "ShoppingItem" }],
  reminders: [{ type: Schema.Types.ObjectId, ref: "Reminder" }],
  subscriptionStatus: { type: String, default: "inactive" },
  accessToken: { type: String, required: false },
  subscriptionId: { type: String, required: false },
  trialEndDate: { type: Date, required: false },
});

export const User = mongoose.model<IUser>("User", userSchema,'test.users');