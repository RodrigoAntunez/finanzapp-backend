import { Request, Response, NextFunction } from "express";
import { Reminder } from "../models/Reminder";
import { Expense } from "../models/Expense"; // Importa el modelo de Expense
import { User } from "../models/User";
import axios from "axios";

const sendWhatsAppMessage = async (to: string, message: string): Promise<void> => {
  try {
    const whatsappApiUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const whatsappToken = process.env.WHATSAPP_TOKEN;

    if (!whatsappToken || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error("WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID no están definidos");
    }

    const response = await axios.post(
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
    console.log("Respuesta enviada al usuario en WhatsApp:", to, response.data);
  } catch (error: any) {
    console.error("Error al enviar mensaje de WhatsApp:", error.message);
    if (error.response) {
      console.error("Detalles del error de WhatsApp:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

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

    if (!entry || !entry[0]?.changes || !entry[0].changes[0]) {
      console.log("Estructura de la solicitud no válida:", entry);
      res.status(400).json({ message: "Estructura de la solicitud no válida" });
      return;
    }

    const changes = entry[0].changes[0];
    const { value } = changes;

    // Manejar eventos de estado (statuses)
    if (value.statuses) {
      const status = value.statuses[0];
      console.log("Evento de estado recibido:", status);
      if (status.status === "failed") {
        console.error("Fallo en el envío del mensaje:", status.errors);
      }
      res.sendStatus(200);
      return;
    }

    // Manejar mensajes entrantes (messages)
    if (!value.messages || !value.messages[0]) {
      console.log("No se encontraron mensajes en el evento");
      res.sendStatus(200);
      return;
    }

    const message = value.messages[0];
    if (message.type !== "text") {
      console.log("Mensaje no es de tipo texto:", message.type);
      await sendWhatsAppMessage(message.from, "Solo se admiten mensajes de texto.");
      res.status(400).json({ message: "Solo se admiten mensajes de texto" });
      return;
    }

    const { from, text } = message;
    const body = text.body;
    console.log("Mensaje de WhatsApp recibido:", body);

    // Añadir el código de país al número de WhatsApp
    const formattedFrom = from.startsWith("+") ? from : `+${from}`;

    // Buscar el usuario por número de WhatsApp
    let user = await User.findOne({ whatsappNumber: from });
    if (!user) {
      console.log("Usuario no encontrado para el número de WhatsApp:", from);
      await sendWhatsAppMessage(
        formattedFrom,
        "No estás registrado. Por favor, regístrate en FinanzApp para usar esta funcionalidad."
      );
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    const userId = user._id;
    console.log("Usuario encontrado:", userId);

    // Verificar el estado de la suscripción
    const isTrialActive = user.trialEndDate && user.trialEndDate > new Date();
    if (user.subscriptionStatus !== "active" && !isTrialActive) {
      console.log("Usuario sin suscripción activa:", userId);
      await sendWhatsAppMessage(
        formattedFrom,
        "Tu suscripción o período de prueba ha expirado. Por favor, actualiza tu plan para continuar usando FinanzApp."
      );
      res.status(403).json({ message: "Suscripción inactiva" });
      return;
    }

    // Verificar el límite de mensajes
    const messageLimit = 10;
    if (user.subscriptionStatus !== "active" && user.messageCount >= messageLimit) {
      console.log("Usuario ha alcanzado el límite de mensajes:", userId);
      await sendWhatsAppMessage(
        formattedFrom,
        `Has alcanzado el límite de ${messageLimit} mensajes. Por favor, actualiza tu plan para continuar usando FinanzApp.`
      );
      res.status(403).json({ message: "Límite de mensajes alcanzado" });
      return;
    }

    // Incrementar el contador de mensajes
    user.messageCount = (user.messageCount || 0) + 1;
    await user.save();
    console.log("Contador de mensajes actualizado:", user.messageCount);

    // Procesar el mensaje
    // 1. Recordatorios: "recordame <tarea> mañana a las <hora>:<minutos>"
    const reminderMatch = body.match(/recordame (.+) mañana a las (\d{1,2}):(\d{2})/i);
    if (reminderMatch) {
      const task = reminderMatch[1];
      const hours = parseInt(reminderMatch[2], 10);
      const minutes = parseInt(reminderMatch[3], 10);
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

      if (!reminder._id) {
        throw new Error("El recordatorio no tiene un _id después de guardarse");
      }

      user.reminders = user.reminders || [];
      user.reminders.push(reminder._id);
      await user.save();
      console.log("Array de reminders del usuario actualizado:", user.reminders);

      await sendWhatsAppMessage(
        formattedFrom,
        `Recordatorio creado: "${task}" para mañana a las ${hours}:${minutes.toString().padStart(2, "0")}.`
      );

      res.status(200).json({ message: "Recordatorio procesado exitosamente" });
      return;
    }

    // 2. Gastos: "Gaste <monto> en <categoría>"
    const expenseMatch = body.match(/gaste (\d+) en (.+)/i);
    if (expenseMatch) {
      const amount = parseInt(expenseMatch[1], 10);
      const category = expenseMatch[2].trim();
      console.log("Gasto extraído - Monto:", amount, "Categoría:", category);

      const newExpense = new Expense({
        user: userId,
        amount,
        category,
        date: new Date(),
      });

      console.log(
        "Guardando gasto desde webhook:",
        JSON.stringify(newExpense, null, 2)
      );
      const expense = await newExpense.save();
      console.log("Gasto guardado exitosamente:", expense);

      // Opcional: Actualizar un array de gastos en el usuario
      user.expenses = user.expenses || [];
      user.expenses.push(expense._id);
      await user.save();
      console.log("Array de expenses del usuario actualizado:", user.expenses);

      await sendWhatsAppMessage(
        formattedFrom,
        `Gasto registrado: $${amount} en ${category}.`
      );

      res.status(200).json({ message: "Gasto procesado exitosamente" });
      return;
    }

    // Si el mensaje no coincide con ningún formato
    console.log("Formato del mensaje no válido:", body);
    await sendWhatsAppMessage(
      formattedFrom,
      "Formato del mensaje no válido. Usa:\n- 'recordame <tarea> mañana a las <hora>:<minutos>' (ejemplo: 'recordame comprar pan mañana a las 9:00')\n- 'gaste <monto> en <categoría>' (ejemplo: 'gaste 100 en panaderia')"
    );
    res.status(400).json({ message: "Formato del mensaje no válido" });
  } catch (error: any) {
    console.error("Error en verifyWebhook:", error.message);
    next(error);
  }
};

export const getWebhook = (req: Request, res: Response) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log("Webhook verificado exitosamente");
    return res.status(200).send(challenge);
  } else {
    console.log("Fallo en la verificación del webhook");
    return res.sendStatus(403);
  }
};