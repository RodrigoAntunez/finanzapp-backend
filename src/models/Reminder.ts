// backend/src/models/Reminder.ts
import mongoose from "mongoose";

export interface IReminder extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  task: string; // Renombramos "description" a "task"
  date: Date;
}

const reminderSchema = new mongoose.Schema<IReminder>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  task: { type: String, required: true }, // Cambiamos "description" a "task"
  date: { type: Date, required: true },
});

export const Reminder = mongoose.model<IReminder>("Reminder", reminderSchema);