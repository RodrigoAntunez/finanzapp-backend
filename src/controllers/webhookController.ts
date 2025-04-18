import { Request, Response, NextFunction } from "express";
import { Reminder } from "../models/Reminder";
import { Expense } from "../models/Expense";
import { User } from "../models/User";
import { ShoppingItem } from "../models/ShoppingItem";
import mongoose, { Schema } from "mongoose";
import axios from "axios";

// Modelo para almacenar mensajes procesados y evitar duplicados
const processedMessageSchema = new Schema({
  messageId: { type: String, required: true, unique: true },
  processedAt: { type: Date, default: Date.now },
});
const ProcessedMessage = mongoose.model("ProcessedMessage", processedMessageSchema);

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
        text: { body: message },
      },
      { headers: { Authorization: `Bearer ${whatsappToken}`, "Content-Type": "application/json" } }
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

export const verifyWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log("Solicitud recibida en POST /api/webhook/verify - Inicio:", JSON.stringify(req.body, null, 2));

    const { object, entry } = req.body;

    if (object !== "whatsapp_business_account") {
      console.log("Solicitud no es un evento de WhatsApp:", object);
      res.status(400).json({ message: "Evento no válido" });
      return;
    }

    console.log("Validando entrada:", JSON.stringify(entry, null, 2));
    if (!entry || entry.length === 0) {
      console.log("Entrada vacía o no definida:", entry);
      res.status(400).json({ message: "Entrada vacía o no válida" });
      return;
    }
    if (!Array.isArray(entry)) {
      console.log("Entrada no es un array:", entry);
      res.status(400).json({ message: "Entrada no es un array válido" });
      return;
    }

    const firstEntry = entry[0];
    console.log("Primera entrada:", JSON.stringify(firstEntry, null, 2));
    if (!firstEntry || !firstEntry.changes || firstEntry.changes.length === 0) {
      console.log("Cambios no válidos o vacíos en la primera entrada:", firstEntry);
      res.status(400).json({ message: "Cambios no válidos o vacíos" });
      return;
    }

    const change = firstEntry.changes[0];
    console.log("Primer cambio:", JSON.stringify(change, null, 2));
    const { value } = change;

    console.log("Contenido de value:", JSON.stringify(value, null, 2));

    if (value.statuses && Array.isArray(value.statuses) && value.statuses.length > 0) {
      const status = value.statuses[0];
      console.log("Evento de estado recibido:", JSON.stringify(status, null, 2));
      if (status.status === "failed") {
        console.error("Fallo en el envío del mensaje:", JSON.stringify(status.errors, null, 2));
      }
      res.sendStatus(200);
      return;
    }

    if (!value.messages || value.messages.length === 0) {
      console.log("No se encontraron mensajes en el evento:", JSON.stringify(value, null, 2));
      res.sendStatus(200);
      return;
    }

    const message = value.messages[0];
    if (message.type !== "text") {
      console.log("Mensaje no es de tipo texto:", message.type);
      const userPhoneNumber = `+${message.from}`;
      console.log("Enviando mensaje a (no texto):", userPhoneNumber);
      await sendWhatsAppMessage(userPhoneNumber, "Solo se admiten mensajes de texto.");
      res.status(200).json({ message: "Solo se admiten mensajes de texto" });
      return;
    }

    // Verificar si el mensaje ya fue procesado
    const messageId = message.id;
    const existingMessage = await ProcessedMessage.findOne({ messageId });
    if (existingMessage) {
      console.log("Mensaje ya procesado anteriormente:", messageId);
      res.status(200).json({ message: "Mensaje ya procesado" });
      return;
    }

    const { from, text } = message;
    const body = text.trim(); // Preservar mayúsculas para el nombre
    console.log("Mensaje de WhatsApp recibido:", body);

    const userPhoneNumber = `+${from}`;
    console.log("Número de usuario formateado (original):", userPhoneNumber);

    const normalizedPhoneNumber = userPhoneNumber.replace(/^\+/, "");
    console.log("Número de usuario normalizado (sin +):", normalizedPhoneNumber);

    console.log("Buscando usuario en MongoDB...");
    const user = await User.findOne({
      $or: [
        { whatsappNumber: userPhoneNumber },
        { whatsappNumber: normalizedPhoneNumber },
      ],
    });
    if (!user) {
      console.log("Usuario no encontrado para el número de WhatsApp:", userPhoneNumber);
      const allUsers = await User.find({}, { whatsappNumber: 1 });
      console.log(`Todos los usuarios en la colección ${User.collection.name}:`, allUsers);
      console.log("Enviando mensaje a (no encontrado):", userPhoneNumber);
      await sendWhatsAppMessage(userPhoneNumber, "No estás registrado. Por favor, regístrate en FinanzApp para usar esta funcionalidad.");
      await new ProcessedMessage({ messageId }).save();
      res.status(200).json({ message: "Usuario no encontrado" });
      return;
    }
    const userId = user._id;
    console.log("Usuario encontrado:", userId);

    // Capturar el nombre si no está registrado
    if (!user.name) {
      user.name = body;
      await user.save();
      console.log(`Nombre actualizado para el usuario ${userPhoneNumber}: ${body}`);

      // Enviar mensaje de bienvenida personalizado
      const dashboardLink = `https://finanzapp-frontend.vercel.app/dashboard/${generateToken(userId.toString())}`;
      const welcomeMessage = `¡Hola, ${body}! Bienvenido/a a FinanzApp. Aquí te explico cómo empezar:\n\n` +
        `1. **Registrar Gastos**: Envía "gaste <monto> en <categoría>" (ejemplo: "gaste 100 en panaderia").\n` +
        `2. **Crear Recordatorios**: Envía "recordame <tarea> mañana a las <hora>:<minutos>" (ejemplo: "recordame comprar pan mañana a las 9:00").\n` +
        `3. **Armar Listas**: Envía "crear lista <nombre>" para empezar una lista de compras (ejemplo: "crear lista supermercado").\n\n` +
        `Accede a tu panel aquí: ${dashboardLink}\n\n` +
        `¿Qué quieres hacer ahora?`;

      console.log("Enviando mensaje de bienvenida a:", userPhoneNumber);
      await sendWhatsAppMessage(userPhoneNumber, welcomeMessage);
      await new ProcessedMessage({ messageId }).save();
      res.status(200).json({ message: "Nombre registrado y bienvenida enviada" });
      return;
    }

    // Verificar suscripción
    const isTrialActive = user.trialEndDate && user.trialEndDate > new Date();
    if (user.subscriptionStatus !== "active" && !isTrialActive) {
      console.log("Usuario sin suscripción activa:", userId);
      console.log("Enviando mensaje a (suscripción):", userPhoneNumber);
      await sendWhatsAppMessage(userPhoneNumber, "Tu suscripción o período de prueba ha expirado. Por favor, actualiza tu plan para continuar usando FinanzApp.");
      res.status(200).json({ message: "Suscripción inactiva" });
      await new ProcessedMessage({ messageId }).save();
      return;
    }

    const messageLimit = 10;
    if (user.subscriptionStatus !== "active" && user.messageCount >= messageLimit) {
      console.log("Usuario ha alcanzado el límite de mensajes:", userId);
      console.log("Enviando mensaje a (límite):", userPhoneNumber);
      await sendWhatsAppMessage(userPhoneNumber, `Has alcanzado el límite de ${messageLimit} mensajes. Por favor, actualiza tu plan para continuar usando FinanzApp.`);
      res.status(200).json({ message: "Límite de mensajes alcanzado" });
      await new ProcessedMessage({ messageId }).save();
      return;
    }

    user.messageCount = (user.messageCount || 0) + 1;
    await user.save();
    console.log("Contador de mensajes actualizado:", user.messageCount);

    // Procesar comando para recordatorios
    const reminderMatch = body.toLowerCase().match(/^recordame\s+(.+)\s+mañana\s+a\s+las\s+(\d{1,2}):(\d{2})$/i);
    if (reminderMatch) {
      const task = reminderMatch[1].trim();
      const hours = parseInt(reminderMatch[2], 10);
      const minutes = parseInt(reminderMatch[3], 10);
      console.log("Tarea extraída:", task);
      console.log("Hora extraída:", hours, ":", minutes);

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.log("Hora o minutos inválidos:", hours, minutes);
        console.log("Enviando mensaje a (hora inválida):", userPhoneNumber);
        await sendWhatsAppMessage(userPhoneNumber, "Hora o minutos inválidos. Usa un formato válido (0-23:00-59).");
        res.status(200).json({ message: "Hora inválida" });
        await new ProcessedMessage({ messageId }).save();
        return;
      }

      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(hours, minutes, 0, 0);
        console.log("Fecha calculada para el recordatorio:", tomorrow);

        const newReminder = new Reminder({ user: userId, task, date: tomorrow });
        console.log("Guardando recordatorio desde webhook:", JSON.stringify(newReminder, null, 2));
        const reminder = await newReminder.save();
        console.log("Recordatorio guardado exitosamente:", reminder);

        if (!reminder._id) throw new Error("El recordatorio no tiene un _id después de guardarse");

        user.reminders = user.reminders || [];
        user.reminders.push(reminder._id);
        await user.save();
        console.log("Array de reminders del usuario actualizado:", user.reminders);

        console.log("Enviando mensaje a (recordatorio):", userPhoneNumber);
        await sendWhatsAppMessage(userPhoneNumber, `Recordatorio creado: "${task}" para mañana a las ${hours}:${minutes.toString().padStart(2, "0")}.`);
        res.status(200).json({ message: "Recordatorio procesado exitosamente" });
        await new ProcessedMessage({ messageId }).save();
      } catch (error: any) {
        console.error("Error al guardar el recordatorio:", error.message);
        await sendWhatsAppMessage(userPhoneNumber, "Hubo un error al crear el recordatorio. Por favor, intenta de nuevo.");
        res.status(500).json({ message: "Error al procesar el recordatorio", error: error.message });
        await new ProcessedMessage({ messageId }).save();
        return;
      }
      return;
    }

    // Procesar comando para gastos
    const expenseMatch = body.toLowerCase().match(/^gaste\s+(\d+)\s+en\s+(.+)$/i);
    if (expenseMatch) {
      const amount = parseInt(expenseMatch[1], 10);
      const category = expenseMatch[2].trim();
      console.log("Gasto extraído - Monto:", amount, "Categoría:", category);

      if (isNaN(amount) || amount <= 0) {
        console.log("Monto inválido:", amount);
        console.log("Enviando mensaje a (monto inválido):", userPhoneNumber);
        await sendWhatsAppMessage(userPhoneNumber, "Monto inválido. Usa un número positivo.");
        res.status(200).json({ message: "Monto inválido" });
        await new ProcessedMessage({ messageId }).save();
        return;
      }

      try {
        const newExpense = new Expense({ user: userId, amount, category, date: new Date() });
        console.log("Guardando gasto desde webhook:", JSON.stringify(newExpense, null, 2));
        const expense = await newExpense.save();
        console.log("Gasto guardado exitosamente:", expense);

        user.expenses = user.expenses || [];
        user.expenses.push(expense._id);
        await user.save();
        console.log("Array de expenses del usuario actualizado:", user.expenses);

        console.log("Enviando mensaje a (gasto):", userPhoneNumber);
        await sendWhatsAppMessage(userPhoneNumber, `Gasto registrado: $${amount} en ${category}.`);
        res.status(200).json({ message: "Gasto procesado exitosamente" });
        await new ProcessedMessage({ messageId }).save();
      } catch (error: any) {
        console.error("Error al guardar el gasto:", error.message);
        await sendWhatsAppMessage(userPhoneNumber, "Hubo un error al registrar el gasto. Por favor, intenta de nuevo.");
        res.status(500).json({ message: "Error al procesar el gasto", error: error.message });
        await new ProcessedMessage({ messageId }).save();
      }
      return;
    }

    // Procesar comando para crear listas de compras
    const listMatch = body.toLowerCase().match(/^crear lista\s+(.+)$/i);
    if (listMatch) {
      const listName = listMatch[1].trim();
      console.log("Nombre de la lista extraído:", listName);

      try {
        const shoppingList = new ShoppingItem({
          userId,
          user: userId,
          items: [], // Lista vacía al crearse
        });
        console.log("Guardando lista de compras:", JSON.stringify(shoppingList, null, 2));
        const savedList = await shoppingList.save();
        console.log("Lista guardada exitosamente:", savedList);

        user.shoppingLists = user.shoppingLists || [];
        user.shoppingLists.push(savedList._id);
        await user.save();
        console.log("Array de shoppingLists del usuario actualizado:", user.shoppingLists);

        console.log("Enviando mensaje a (lista):", userPhoneNumber);
        await sendWhatsAppMessage(userPhoneNumber, `Lista de compras "${listName}" creada. Envía "agregar <elemento> a ${listName}" para añadir elementos.`);
        res.status(200).json({ message: "Lista creada exitosamente" });
        await new ProcessedMessage({ messageId }).save();
      } catch (error: any) {
        console.error("Error al crear la lista:", error.message);
        await sendWhatsAppMessage(userPhoneNumber, "Hubo un error al crear la lista. Por favor, intenta de nuevo.");
        res.status(500).json({ message: "Error al procesar la lista", error: error.message });
        await new ProcessedMessage({ messageId }).save();
      }
      return;
    }

    // Mensaje no válido
    console.log("Formato del mensaje no válido:", body);
    console.log("Enviando mensaje a (formato inválido):", userPhoneNumber);
    await sendWhatsAppMessage(
      userPhoneNumber,
      `Hola, ${user.name}. No entendí tu mensaje. Usa:\n` +
      `- "gaste <monto> en <categoría>" (ejemplo: "gaste 100 en panaderia")\n` +
      `- "recordame <tarea> mañana a las <hora>:<minutos>" (ejemplo: "recordame comprar pan mañana a las 9:00")\n` +
      `- "crear lista <nombre>" (ejemplo: "crear lista supermercado")\n` +
      `¿Qué quieres hacer ahora?`
    );
    res.status(200).json({ message: "Procesado, pero formato inválido" });
    await new ProcessedMessage({ messageId }).save();
  } catch (error: any) {
    console.error("Error en verifyWebhook:", error.message);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
    return;
  }
};

export const getWebhook = (req: Request, res: Response) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Webhook verificado exitosamente");
    return res.status(200).send(challenge);
  } else {
    console.log("Fallo en la verificación del webhook.");
    return res.sendStatus(403);
  }
};

// Función para generar token
const generateToken = (userId: string) => {
  const jwt = require("jsonwebtoken");
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};