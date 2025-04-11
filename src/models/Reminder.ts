// backend/src/models/Reminder.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IReminder extends Document {
  _id: Types.ObjectId; // Añadimos explícitamente el tipo de _id
  user: Types.ObjectId;
  task: string;
  date: Date;
}

const reminderSchema = new Schema<IReminder>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  task: { type: String, required: true },
  date: { type: Date, required: true },
});

export const Reminder = model<IReminder>("Reminder", reminderSchema);