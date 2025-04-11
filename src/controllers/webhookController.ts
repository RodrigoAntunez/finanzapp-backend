// backend/src/controllers/webhookController.ts
import { Request, Response, NextFunction } from "express";
import { Reminder } from "../models/Reminder";
import { User } from "../models/User";
import axios from "axios";

export const verifyWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log(
      "Solicitud recibida en POST /api/webhook/verify:",
      JSON.stringify(req.body, null, 2)
    );

    const { object, entry } = req.body;

    if (object !== "whatsapp_business_account") {
      console.log("Solicitud no es un evento de WhatsApp:", object);
      res.status(400).json({ message: "Evento no válido" });
      return;
    }

    if (!entry || !entry[0]?.changes || !entry[0].changes[0]?.value?.messages) {
      console.log("Estructura de la solicitud no válida:", entry);
      res.status(400).json({ message: "Estructura de la solicitud no válida" });
      return;
    }

    const message = entry[0].changes[0].value.messages[0];
    if (message.type !== "text") {
      console.log("Mensaje no es de tipo texto:", message.type);
      res.status(400).json({ message: "Solo se admiten mensajes de texto" });
      return;
    }

    const { from, text } = message;
    const body = text.body;
    console.log("Mensaje de WhatsApp recibido:", body);

    // Buscar el usuario por número de WhatsApp
    const user = await User.findOne({ whatsappNumber: from });
    if (!user) {
      console.log("Usuario no encontrado para el número de WhatsApp:", from);
      await sendWhatsAppMessage(
        from,
        "No estás registrado. Por favor, regístrate en FinanzApp para usar esta funcionalidad."
      );
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    const userId = user._id;
    console.log("Usuario encontrado:", userId);

    // Verificar el estado de la suscripción
    if (user.subscriptionStatus !== "active" && user.trialEndDate && user.trialEndDate < new Date()) {
      console.log("Usuario sin suscripción activa:", userId);
      await sendWhatsAppMessage(
        from,
        "Tu suscripción o período de prueba ha expirado. Por favor, actualiza tu plan para crear recordatorios."
      );
      res.status(403).json({ message: "Suscripción inactiva" });
      return;
    }

    // Verificar el límite de mensajes (por ejemplo, 10 mensajes para usuarios gratuitos)
    const messageLimit = 10;
    if (user.subscriptionStatus !== "active" && user.messageCount >= messageLimit) {
      console.log("Usuario ha alcanzado el límite de mensajes:", userId);
      await sendWhatsAppMessage(
        from,
        `Has alcanzado el límite de ${messageLimit} mensajes. Por favor, actualiza tu plan para continuar usando FinanzApp.`
      );
      res.status(403).json({ message: "Límite de mensajes alcanzado" });
      return;
    }

    // Incrementar el contador de mensajes
    user.messageCount += 1;
    await user.save();
    console.log("Contador de mensajes actualizado:", user.messageCount);

    // Procesar el mensaje para crear un recordatorio
    const match = body.match(/recordame (.+) mañana a las (\d{1,2}):(\d{2})/i);
    if (!match) {
      console.log("Formato del mensaje no válido:", body);
      await sendWhatsAppMessage(
        from,
        "Formato del mensaje no válido. Usa: 'recordame <tarea> mañana a las <hora>:<minutos>' (ejemplo: 'recordame comprar pan mañana a las 9:00')."
      );
      res.status(400).json({ message: "Formato del mensaje no válido" });
      return;
    }

    const task = match[1];
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    console.log("Tarea extraída:", task);
    console.log("Hora extraída:", hours, ":", minutes);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);
    console.log("Fecha calculada para el recordatorio:", tomorrow);

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

    // Verificar que reminder._id esté definido
    if (!reminder._id) {
      throw new Error("El recordatorio no tiene un _id después de guardarse");
    }

    // Actualizar el array de reminders del usuario
    user.reminders.push(reminder._id); // Ahora TypeScript debería reconocer reminder._id como ObjectId
    await user.save();
    console.log("Array de reminders del usuario actualizado:", user.reminders);

    // Enviar una respuesta al usuario
    await sendWhatsAppMessage(
      from,
      `Recordatorio creado: "${task}" para mañana a las ${hours}:${minutes.toString().padStart(2, "0")}.`
    );

    res.status(200).json({ message: "Mensaje procesado exitosamente" });
  } catch (error: any) {
    console.error("Error en verifyWebhook:", error.message);
    next(error);
  }
};

const sendWhatsAppMessage = async (to: string, message: string): Promise<void> => {
  try {
    const whatsappApiUrl = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const whatsappToken = process.env.WHATSAPP_TOKEN;

    await axios.post(
      whatsappApiUrl,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Respuesta enviada al usuario en WhatsApp:", to);
  } catch (error: any) {
    console.error("Error al enviar mensaje de WhatsApp:", error.message);
    throw error;
  }
};