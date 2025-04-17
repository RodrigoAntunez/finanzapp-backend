import { Schema, model, Document, Types } from "mongoose";
import { IUser } from "./User"; // Importa IUser

export interface IExpense extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser; // Usamos solo 'user' en lugar de 'userId'
  amount: number;
  category: string;
  description?: string;
  shared: boolean;
  members?: Types.ObjectId[];
  division?: string;
  reminderDate?: Date;
  date: Date;
}

const expenseSchema = new Schema<IExpense>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Eliminamos 'userId', usamos solo 'user'
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: false },
  shared: { type: Boolean, default: false },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  division: { type: String, required: false },
  reminderDate: { type: Date, required: false },
  date: { type: Date, default: Date.now },
});

export const Expense = model<IExpense>("Expense", expenseSchema);