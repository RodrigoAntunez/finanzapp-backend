// backend/src/models/Expense.ts
import { Schema, model, Document, Types } from "mongoose";
import { IUser } from "./User"; // Importa IUser

export interface IExpense extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  user: Types.ObjectId | IUser; // Añadimos user (puede ser el mismo que userId, dependiendo de tu lógica)
  amount: number;
  category: string;
  description?: string; // Añadimos description
  shared: boolean; // Añadimos shared
  members?: Types.ObjectId[]; // Añadimos members (arreglo de ObjectId para los usuarios con los que se comparte el gasto)
  division?: string; // Añadimos division (por ejemplo, "equal" o "custom")
  reminderDate?: Date; // Añadimos reminderDate
  date: Date;
}

const expenseSchema = new Schema<IExpense>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Añadimos user
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: false }, // Añadimos description
  shared: { type: Boolean, default: false }, // Añadimos shared
  members: [{ type: Schema.Types.ObjectId, ref: "User" }], // Añadimos members
  division: { type: String, required: false }, // Añadimos division
  reminderDate: { type: Date, required: false }, // Añadimos reminderDate
  date: { type: Date, default: Date.now },
});

export const Expense = model<IExpense>("Expense", expenseSchema);