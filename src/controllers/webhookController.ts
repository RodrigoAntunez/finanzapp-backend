// backend/src/controllers/webhookController.ts
import { Request, Response, NextFunction } from "express";
import { Reminder } from "../models/Reminder";

export const verifyWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(
      "Solicitud recibida en POST /api/webhook/verify:",
      JSON.stringify(req.body, null, 2)
    );

    const { object, entry } = req.body;

    // Verificar que sea un evento de WhatsApp
    if (object !== "whatsapp_business_account") {
      console.log("Solicitud no es un evento de WhatsApp:", object);
      return res.status(400).json({ message: "Evento no válido" });
    }

    if (!entry || !entry[0]?.changes || !entry[0].changes[0]?.value?.messages) {
      console.log("Estructura de la solicitud no válida:", entry);
      return res.status(400).json({ message: "Estructura de la solicitud no válida" });
    }

    const message = entry[0].changes[0].value.messages[0];
    if (message.type !== "text") {
      console.log("Mensaje no es de tipo texto:", message.type);
      return res.status(400).json({ message: "Solo se admiten mensajes de texto" });
    }

    const { from, text } = message;
    const body = text.body;
    console.log("Mensaje de WhatsApp recibido:", body);

    // Aquí deberías buscar el usuario asociado al número de teléfono (from)
    // Por simplicidad, asumimos que el usuario ya está registrado y usamos un userId fijo
    const userId = "67f5134defaf5df05698f73f"; // Reemplaza con el userId real
    console.log("Usuario asociado al número de teléfono:", userId);

    // Procesar el mensaje para crear un recordatorio
    // Ejemplo: "recordame comprar leche mañana a las 10:00"
    const match = body.match(/recordame (.+) mañana a las (\d{1,2}):(\d{2})/i);
    if (!match) {
      console.log("Formato del mensaje no válido:", body);
      return res.status(400).json({ message: "Formato del mensaje no válido" });
    }

    const task = match[1]; // "comprar leche"
    const hours = parseInt(match[2], 10); // "10"
    const minutes = parseInt(match[3], 10); // "00"
    console.log("Tarea extraída:", task);
    console.log("Hora extraída:", hours, ":", minutes);

    // Calcular la fecha de mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);
    console.log("Fecha calculada para el recordatorio:", tomorrow);

    // Crear el recordatorio
    const newReminder = new Reminder({
      user: userId,
      task,
      date: tomorrow,
    });

    console.log(
      "Guardando recordatorio desde webhook:",
      JSON.stringify(newReminder, null, 2)
    );
    const reminder = await newReminder.save();
    console.log("Recordatorio guardado exitosamente:", reminder);

    res.status(200).json({ message: "Mensaje procesado exitosamente" });
  } catch (error: any) {
    console.error("Error en verifyWebhook:", error.message);
    next(error);
  }
};