// backend/src/models/PendingExpense.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPendingExpense extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  category: string;
  description: string;
  createdAt: Date;
}

const pendingExpenseSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "1h" }, // Expira después de 1 hora
});

export const PendingExpense = mongoose.model<IPendingExpense>("PendingExpense", pendingExpenseSchema);