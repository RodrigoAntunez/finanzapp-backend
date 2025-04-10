// backend/src/controllers/reminderController.ts
import { Request, Response, NextFunction } from "express";
import { Reminder } from "../models/Reminder";

interface AuthRequest extends Request {
  user?: { id: string };
}

export const getReminders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }

    const reminders = await Reminder.find({ user: userId }).sort({ date: -1 });
    res.json(reminders);
  } catch (err: any) {
    console.error("Error en getReminders:", err.message);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const createReminder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log(
      "Solicitud recibida en POST /api/reminders:",
      JSON.stringify(req.body, null, 2)
    );

    // Obtener el usuario autenticado desde el middleware de autenticación
    const userId = req.user?.id;
    if (!userId) {
      console.log("Usuario no autenticado en POST /api/reminders");
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }
    console.log("Usuario autenticado:", { id: userId });

    // Mapear los campos de la solicitud a los del modelo
    const { task, dueDate } = req.body as {
      task?: string;
      dueDate?: string;
    };

    // Validar los campos requeridos
    if (!task || !dueDate) {
      console.log(
        "Faltan campos requeridos en POST /api/reminders: task y dueDate son obligatorios"
      );
      res
        .status(400)
        .json({ message: "Por favor, proporciona la tarea y la fecha de vencimiento" });
      return;
    }

    // Crear el recordatorio
    const newReminder = new Reminder({
      user: userId, // Usamos "user" en lugar de "userId" para coincidir con el modelo
      task, // Usamos "task" en lugar de "description"
      date: new Date(dueDate), // Convertimos dueDate a un objeto Date
    });

    console.log(
      "Guardando recordatorio en la base de datos:",
      JSON.stringify(newReminder, null, 2)
    );
    const reminder = await newReminder.save();
    console.log("Recordatorio guardado exitosamente:", reminder);

    res.status(201).json({
      message: "Recordatorio creado exitosamente",
      reminder,
    });
  } catch (err: any) {
    console.error("Error en createReminder:", err.message);
    next(err); // Pasamos el error al middleware de manejo de errores
  }
};