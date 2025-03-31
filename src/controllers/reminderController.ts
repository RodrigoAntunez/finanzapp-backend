// backend/src/controllers/reminderController.ts
import { Request, Response } from "express";
import { Reminder } from "../models/Reminder";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const getReminders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reminders = await Reminder.find({ userId: req.user?.id }).sort({ date: -1 });
    res.json(reminders);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

export const createReminder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, date, color } = req.body as {
      title: string;
      description?: string;
      date: string; // Formato: yyyy-MM-dd o dd/MM/yyyy
      color: string;
    };

    // Convertir la fecha de yyyy-MM-dd a dd/MM/yyyy si es necesario
    let formattedDate = date;
    if (date.includes("-")) {
      const [year, month, day] = date.split("-").map(Number);
      formattedDate = `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`;
    }

    const newReminder = new Reminder({
      userId: req.user?.id,
      title,
      description,
      date: formattedDate,
      color,
    });

    const reminder = await newReminder.save();
    res.json(reminder);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};