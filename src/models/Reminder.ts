// backend/src/models/Reminder.ts
import mongoose from "mongoose";

export interface IReminder extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  description: string;
  date: Date;
}

const reminderSchema = new mongoose.Schema<IReminder>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
});

export const Reminder = mongoose.model<IReminder>("Reminder", reminderSchema);