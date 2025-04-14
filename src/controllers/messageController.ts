// // backend/src/controllers/messageController.ts
// import { Request, Response, NextFunction } from "express";
// import asyncHandler from "express-async-handler";
// import axios from "axios";
// import { User, IUser } from "../models/User";
// import { Expense, IExpense } from "../models/Expense";
// import { ShoppingItem, IShoppingItem } from "../models/ShoppingItem";
// import { Reminder, IReminder } from "../models/Reminder";
// import mongoose from "mongoose";
// import { parseMessage } from "../utils/messageParser";
// import { generateResponse } from "../utils/responseGenerator";

// // Definimos un tipo para el error de axios (si AxiosError no está disponible)
// interface AxiosErrorLike {
//   response?: {
//     data?: any;
//   };
//   message: string;
// }

// // Exporta la función sendWhatsAppMessage
// export const sendWhatsAppMessage = async (to: string, message: string) => {
//   const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
//   const data = {
//     messaging_product: "whatsapp",
//     to: to,
//     type: "text",
//     text: { body: message },
//   };

//   try {
//     await axios.post(url, data, {
//       headers: {
//         Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//     });
//     console.log(`Mensaje enviado a ${to}: ${message}`);
//   } catch (error) {
//     const axiosError = error as AxiosErrorLike;
//     console.error(
//       "Error enviando mensaje de WhatsApp:",
//       axiosError.response?.data || axiosError.message || "Error desconocido"
//     );
//     throw new Error("No se pudo enviar el mensaje de WhatsApp");
//   }
// };

// // Handle incoming WhatsApp messages
// export const handleIncomingMessage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//   // Verificar el webhook (GET request)
//   if (req.method === "GET") {
//     const mode = req.query["hub.mode"];
//     const token = req.query["hub.verify_token"];
//     const challenge = req.query["hub.challenge"];

//     console.log("Verificando webhook:", { mode, token, challenge });

//     if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
//       console.log("Webhook verificado");
//       res.status(200).send(challenge);
//     } else {
//       console.log("Verificación fallida. Token esperado:", process.env.VERIFY_TOKEN, "Token recibido:", token);
//       res.status(403).json({ message: "Verificación fallida" });
//     }
//     return;
//   }

//   // Procesar mensajes entrantes (POST request)
//   const body = req.body;

//   if (body.object !== "whatsapp_business_account") {
//     res.status(404).send();
//     return;
//   }

//   const entry = body.entry?.[0];
//   const change = entry?.changes?.[0];
//   const message = change?.value?.messages?.[0];

//   if (!message) {
//     res.status(200).send();
//     return;
//   }

//   const from = message.from;
//   const text = message.text?.body;

//   let user: IUser | null = await User.findOne({ whatsappNumber: from });
//   if (!user) {
//     user = new User({
//       whatsappNumber: from,
//       messageCount: 0,
//       expenses: [],
//       shoppingLists: [],
//       reminders: [],
//       subscriptionStatus: "inactive",
//     });
//     await user.save();
//   }

//   user.messageCount = (user.messageCount || 0) + 1;
//   await user.save();

//   let responseMessage = generateResponse("default", {});

//   try {
//     const parsedMessage = parseMessage(text);

//     switch (parsedMessage.type) {
//       case "expense":
//         const { amount, category, description } = parsedMessage.data;
//         const expense: IExpense = new Expense({
//           userId: user._id,
//           user: user._id,
//           amount,
//           category,
//           date: new Date(),
//         });
//         await expense.save();

//         user.expenses.push(new mongoose.Types.ObjectId(expense._id.toString()));
//         await user.save();

//         responseMessage = generateResponse("expense", { amount, category });
//         break;

//       case "reminder":
//         const { task, time, date } = parsedMessage.data;
//         const reminder: IReminder = new Reminder({
//           userId: user._id,
//           task,
//           time,
//           date,
//           sent: false,
//         });
//         await reminder.save();

//         // Aseguramos que reminder._id sea tratado como un ObjectId
//         user.reminders.push(new mongoose.Types.ObjectId((reminder._id as mongoose.Types.ObjectId).toString()));
//         await user.save();

//         responseMessage = generateResponse("reminder", { task, time, date });
//         break;

//       case "shopping_list":
//         const { items } = parsedMessage.data;
//         const shoppingList: IShoppingItem = new ShoppingItem({
//           userId: user._id,
//           items: items.map((item: string) => ({ name: item, purchased: false })),
//         });
//         await shoppingList.save();

//         user.shoppingLists.push(new mongoose.Types.ObjectId(shoppingList._id.toString()));
//         await user.save();

//         responseMessage = generateResponse("shopping_list", { items });
//         break;

//       case "summary_current_month":
//         const now = new Date(); // Definimos 'now' aquí para usarlo en este bloque
//         const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//         const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

//         const expensesCurrentMonth = await Expense.find({
//           userId: user._id,
//           date: { $gte: startOfMonth, $lte: endOfMonth },
//         });

//         const totalCurrentMonth = expensesCurrentMonth.reduce((sum, exp) => sum + exp.amount, 0);
//         const monthCurrent = now.toLocaleString("es-AR", { month: "long", year: "numeric" });

//         responseMessage = generateResponse("summary_current_month", {
//           total: totalCurrentMonth,
//           month: monthCurrent,
//           expenses: expensesCurrentMonth,
//         });
//         break;

//       case "summary_last_month":
//         const nowForLastMonth = new Date(); // Definimos 'now' para este bloque
//         const startOfLastMonth = new Date(nowForLastMonth.getFullYear(), nowForLastMonth.getMonth() - 1, 1);
//         const endOfLastMonth = new Date(nowForLastMonth.getFullYear(), nowForLastMonth.getMonth(), 0);

//         const expensesLastMonth = await Expense.find({
//           userId: user._id,
//           date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
//         });

//         const totalLastMonth = expensesLastMonth.reduce((sum, exp) => sum + exp.amount, 0);
//         const monthLast = startOfLastMonth.toLocaleString("es-AR", { month: "long", year: "numeric" });

//         const categoryTotals: { [key: string]: number } = {};
//         expensesLastMonth.forEach((exp) => {
//           categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
//         });

//         let topCategory = null;
//         if (Object.keys(categoryTotals).length > 0) {
//           const topCategoryName = Object.keys(categoryTotals).reduce((a, b) =>
//             categoryTotals[a] > categoryTotals[b] ? a : b
//           );
//           topCategory = { category: topCategoryName, total: categoryTotals[topCategoryName] };
//         }

//         responseMessage = generateResponse("summary_last_month", {
//           total: totalLastMonth,
//           month: monthLast,
//           expenses: expensesLastMonth,
//           topCategory,
//         });
//         break;

//       case "pending_reminders":
//         const reminders = await Reminder.find({ userId: user._id, sent: false });
//         responseMessage = generateResponse("pending_reminders", { reminders });
//         break;

//       case "shopping_lists":
//         const lists = await ShoppingItem.find({ userId: user._id });
//         responseMessage = generateResponse("shopping_lists", { lists });
//         break;

//       default:
//         responseMessage = generateResponse("default", {});
//     }
//   } catch (error: any) {
//     if (text.toLowerCase().startsWith("registra un gasto")) {
//       const match = text.match(/registra un gasto de \$(\d+) en (\w+)/i);
//       if (match) {
//         const amount = parseFloat(match[1]);
//         const category = match[2];

//         const expense: IExpense = new Expense({
//           userId: user._id,
//           user: user._id,
//           amount,
//           category,
//           date: new Date(),
//         });
//         await expense.save();

//         user.expenses.push(new mongoose.Types.ObjectId(expense._id.toString()));
//         await user.save();

//         responseMessage = generateResponse("expense", { amount, category });
//       } else {
//         responseMessage = generateResponse("expense_error", {});
//       }
//     } else if (text.toLowerCase().startsWith("crear lista de compras")) {
//       const itemsText = text.replace(/crear lista de compras con /i, "");
//       const items = itemsText.split(", ").map((item: string) => item.trim()).filter((item: string) => item);
//       if (items.length > 0) {
//         const shoppingList: IShoppingItem = new ShoppingItem({
//           userId: user._id,
//           items: items.map((item: string) => ({ name: item, purchased: false })),
//         });
//         await shoppingList.save();

//         user.shoppingLists.push(new mongoose.Types.ObjectId(shoppingList._id.toString()));
//         await user.save();

//         responseMessage = generateResponse("shopping_list", { items });
//       } else {
//         responseMessage = generateResponse("shopping_list_error", {});
//       }
//     } else {
//       responseMessage = generateResponse("default", {});
//       console.error("Error al parsear el mensaje:", error.message);
//     }
//   }

//   await sendWhatsAppMessage(from, responseMessage);
//   console.log("Mensaje procesado:", { from, text, response: responseMessage });

//   res.status(200).send();
// });

// backend/src/controllers/messageController.ts
// backend/src/controllers/messageController.ts
// backend/src/controllers/messageController.ts
// src/controllers/messageController.ts
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import axios from "axios";
import { User, IUser } from "../models/User";
import { Expense, IExpense } from "../models/Expense";
import { PendingExpense, IPendingExpense } from "../models/PendingExpense";
import { ShoppingItem, IShoppingItem } from "../models/ShoppingItem";
import { Reminder, IReminder } from "../models/Reminder";
import mongoose from "mongoose";
import { parseMessage } from "../utils/messageParser";
import { generateResponse } from "../utils/responseGenerator";

// Definimos un tipo para el error de axios
interface AxiosErrorLike {
  response?: {
    data?: any;
  };
  message: string;
}

// Función para enviar un mensaje interactivo con botones
export const sendInteractiveMessage = async (to: string, body: string, expenseId: string) => {
  const url = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: "whatsapp",
    to: to,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: body,
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: `confirm_${expenseId}`,
              title: "Confirmar",
            },
          },
          {
            type: "reply",
            reply: {
              id: `reject_${expenseId}`,
              title: "Rechazar",
            },
          },
        ],
      },
    },
  };

  try {
    await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    console.log(`Mensaje interactivo enviado a ${to}: ${body}`);
  } catch (error) {
    const axiosError = error as AxiosErrorLike;
    console.error(
      "Error enviando mensaje interactivo de WhatsApp:",
      axiosError.response?.data || axiosError.message || "Error desconocido"
    );
    throw new Error("No se pudo enviar el mensaje interactivo de WhatsApp");
  }
};

// Exporta la función sendWhatsAppMessage
export const sendWhatsAppMessage = async (to: string, message: string) => {
  const url = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: { body: message },
  };

  try {
    await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    console.log(`Mensaje enviado a ${to}: ${message}`);
  } catch (error) {
    const axiosError = error as AxiosErrorLike;
    console.error(
      "Error enviando mensaje de WhatsApp:",
      axiosError.response?.data || axiosError.message || "Error desconocido"
    );
    throw new Error("No se pudo enviar el mensaje de WhatsApp");
  }
};

// Handle incoming WhatsApp messages (renombrado a processMessage)
export const processMessage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Verificar el webhook (GET request)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("Verificando webhook:", { mode, token, challenge });

    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      console.log("Webhook verificado");
      res.status(200).send(challenge);
    } else {
      console.log("Verificación fallida. Token esperado:", process.env.VERIFY_TOKEN, "Token recibido:", token);
      res.status(403).json({ message: "Verificación fallida" });
    }
    return;
  }

  // Procesar mensajes entrantes (POST request)
  const body = req.body;

  if (body.object !== "whatsapp_business_account") {
    res.status(404).send();
    return;
  }

  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];

  if (!message) {
    res.status(200).send();
    return;
  }

  const from = message.from;

  // Manejar mensajes de tipo "button" (respuesta a botones interactivos)
  if (message.type === "button") {
    const buttonId = message.button.reply.id; // Ejemplo: "confirm_123" o "reject_123"
    const [action, expenseId] = buttonId.split("_");

    const pendingExpense = await PendingExpense.findById(expenseId);
    if (!pendingExpense) {
      console.log("Simulación de mensaje enviado:", {
        to: from,
        message: "❌ No se encontró el gasto pendiente. Puede que haya expirado.",
      });
      res.status(200).send();
      return;
    }

    if (action === "confirm") {
      // Guardar el gasto en la colección Expense
      const expense: IExpense = new Expense({
        userId: pendingExpense.userId,
        user: pendingExpense.userId,
        amount: pendingExpense.amount,
        category: pendingExpense.category,
        date: new Date(),
      });
      await expense.save();

      const user = await User.findById(pendingExpense.userId);
      if (user) {
        user.expenses.push(new mongoose.Types.ObjectId(expense._id.toString()));
        await user.save();
      }

      // Eliminar el gasto pendiente
      await PendingExpense.deleteOne({ _id: expenseId });

      console.log("Simulación de mensaje enviado:", {
        to: from,
        message: "✅ Gasto confirmado y registrado:\n\n" +
                 `💰 *Monto:* $${pendingExpense.amount}\n` +
                 `📁 *Categoría:* ${pendingExpense.category}\n` +
                 `📅 *Fecha:* ${new Date().toLocaleDateString("es-AR")}\n\n` +
                 `¿Quieres ver más detalles? Visita: https://tu-usuario.github.io/finanzapp-web/`,
      });
    } else if (action === "reject") {
      // Eliminar el gasto pendiente
      await PendingExpense.deleteOne({ _id: expenseId });

      console.log("Simulación de mensaje enviado:", {
        to: from,
        message: "❌ Gasto rechazado. No se ha registrado.",
      });
    }

    res.status(200).send();
    return;
  }

  // Manejar mensajes de texto
  const text = message.text?.body;

  let user: IUser | null = await User.findOne({ whatsappNumber: from });
  if (!user) {
    user = new User({
      whatsappNumber: from,
      messageCount: 0,
      expenses: [],
      shoppingLists: [],
      reminders: [],
      subscriptionStatus: "inactive",
    });
    await user.save();
  }

  user.messageCount = (user.messageCount || 0) + 1;
  await user.save();

  let responseMessage = generateResponse("default", {});

  try {
    const parsedMessage = parseMessage(text);

    switch (parsedMessage.type) {
      case "expense":
        const { amount, category, description } = parsedMessage.data;

        // Guardar el gasto como pendiente
        const pendingExpense: IPendingExpense = new PendingExpense({
          userId: user._id,
          amount,
          category,
          description,
        });

        console.log("Intentando guardar el gasto pendiente:", {
          userId: user._id,
          amount,
          category,
          description,
        });

        try {
          await pendingExpense.save();
          console.log("Gasto pendiente guardado exitosamente:", {
            id: pendingExpense._id,
            amount: pendingExpense.amount,
            category: pendingExpense.category,
          });
        } catch (error) {
          console.error("Error al guardar el gasto pendiente:", error);
          throw error; // Lanza el error para que se maneje en el catch externo
        }

        // Enviar mensaje interactivo con botones
        const confirmationMessage =
          `📝 *Gasto pendiente de confirmación:*\n\n` +
          `💰 *Monto:* $${amount}\n` +
          `📁 *Categoría:* ${category}\n\n` +
          `¿Deseas confirmar este gasto?`;

        console.log("Simulación de mensaje interactivo enviado:", {
          to: from,
          message: confirmationMessage,
          buttons: ["Confirmar", "Rechazar"],
        });

        // Comentamos el envío real hasta que Meta reactive tu cuenta
        // await sendInteractiveMessage(from, confirmationMessage, pendingExpense._id.toString());

        break;

      case "reminder":
        const { task, time, date } = parsedMessage.data;
        const reminder: IReminder = new Reminder({
          userId: user._id,
          task,
          time,
          date,
          sent: false,
        });
        await reminder.save();

        user.reminders.push(new mongoose.Types.ObjectId((reminder._id as mongoose.Types.ObjectId).toString()));
        await user.save();

        responseMessage = generateResponse("reminder", { task, time, date });
        console.log("Simulación de mensaje enviado:", { to: from, message: responseMessage });
        break;

      case "shopping_list":
        const { items } = parsedMessage.data;
        const shoppingList: IShoppingItem = new ShoppingItem({
          userId: user._id,
          items: items.map((item: string) => ({ name: item, purchased: false })),
        });
        await shoppingList.save();

        user.shoppingLists.push(new mongoose.Types.ObjectId(shoppingList._id.toString()));
        await user.save();

        responseMessage = generateResponse("shopping_list", { items });
        console.log("Simulación de mensaje enviado:", { to: from, message: responseMessage });
        break;

      case "summary_current_month":
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const expensesCurrentMonth = await Expense.find({
          userId: user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        });

        const totalCurrentMonth = expensesCurrentMonth.reduce((sum, exp) => sum + exp.amount, 0);
        const monthCurrent = now.toLocaleString("es-AR", { month: "long", year: "numeric" });

        responseMessage = generateResponse("summary_current_month", {
          total: totalCurrentMonth,
          month: monthCurrent,
          expenses: expensesCurrentMonth,
        });
        console.log("Simulación de mensaje enviado:", { to: from, message: responseMessage });
        break;

      case "summary_last_month":
        const nowForLastMonth = new Date();
        const startOfLastMonth = new Date(nowForLastMonth.getFullYear(), nowForLastMonth.getMonth() - 1, 1);
        const endOfLastMonth = new Date(nowForLastMonth.getFullYear(), nowForLastMonth.getMonth(), 0);

        const expensesLastMonth = await Expense.find({
          userId: user._id,
          date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        });

        const totalLastMonth = expensesLastMonth.reduce((sum, exp) => sum + exp.amount, 0);
        const monthLast = startOfLastMonth.toLocaleString("es-AR", { month: "long", year: "numeric" });

        const categoryTotals: { [key: string]: number } = {};
        expensesLastMonth.forEach((exp) => {
          categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
        });

        let topCategory = null;
        if (Object.keys(categoryTotals).length > 0) {
          const topCategoryName = Object.keys(categoryTotals).reduce((a, b) =>
            categoryTotals[a] > categoryTotals[b] ? a : b
          );
          topCategory = { category: topCategoryName, total: categoryTotals[topCategoryName] };
        }

        responseMessage = generateResponse("summary_last_month", {
          total: totalLastMonth,
          month: monthLast,
          expenses: expensesLastMonth,
          topCategory,
        });
        console.log("Simulación de mensaje enviado:", { to: from, message: responseMessage });
        break;

      case "pending_reminders":
        const reminders = await Reminder.find({ userId: user._id, sent: false });
        responseMessage = generateResponse("pending_reminders", { reminders });
        console.log("Simulación de mensaje enviado:", { to: from, message: responseMessage });
        break;

      case "shopping_lists":
        const lists = await ShoppingItem.find({ userId: user._id });
        responseMessage = generateResponse("shopping_lists", { lists });
        console.log("Simulación de mensaje enviado:", { to: from, message: responseMessage });
        break;

      default:
        responseMessage = generateResponse("default", {});
        console.log("Simulación de mensaje enviado:", { to: from, message: responseMessage });
    }
  } catch (error: any) {
    if (text.toLowerCase().startsWith("registra un gasto")) {
      const match = text.match(/registra un gasto de \$(\d+) en (\w+)/i);
      if (match) {
        const amount = parseFloat(match[1]);
        const category = match[2];
    
        const pendingExpense: IPendingExpense = new PendingExpense({
          userId: user._id,
          amount,
          category,
          description: category,
        });
    
        console.log("Intentando guardar el gasto pendiente (registra un gasto):", {
          userId: user._id,
          amount,
          category,
          description: category,
        });
    
        try {
          await pendingExpense.save();
          console.log("Gasto pendiente guardado exitosamente (registra un gasto):", {
            id: pendingExpense._id,
            amount: pendingExpense.amount,
            category: pendingExpense.category,
          });
        } catch (error) {
          console.error("Error al guardar el gasto pendiente (registra un gasto):", error);
          throw error;
        }
    
        const confirmationMessage =
          `📝 *Gasto pendiente de confirmación:*\n\n` +
          `💰 *Monto:* $${amount}\n` +
          `📁 *Categoría:* ${category}\n\n` +
          `¿Deseas confirmar este gasto?`;
    
        console.log("Simulación de mensaje interactivo enviado:", {
          to: from,
          message: confirmationMessage,
          buttons: ["Confirmar", "Rechazar"],
        });
    
        // Comentamos el envío real hasta que Meta reactive tu cuenta
        // await sendInteractiveMessage(from, confirmationMessage, pendingExpense._id.toString());
      } else {
        responseMessage = generateResponse("expense_error", {});
        console.log("Simulación de mensaje enviado:", { to: from, message: responseMessage });
      }
    } else if (text.toLowerCase().startsWith("crear lista de compras")) {
      const itemsText = text.replace(/crear lista de compras con /i, "");
      const items = itemsText.split(", ").map((item: string) => item.trim()).filter((item: string) => item);
      if (items.length > 0) {
        const shoppingList: IShoppingItem = new ShoppingItem({
          userId: user._id,
          items: items.map((item: string) => ({ name: item, purchased: false })),
        });
        await shoppingList.save();

        user.shoppingLists.push(new mongoose.Types.ObjectId(shoppingList._id.toString()));
        await user.save();

        responseMessage = generateResponse("shopping_list", { items });
        console.log("Simulación de mensaje enviado:", { to: from, message: responseMessage });
      } else {
        responseMessage = generateResponse("shopping_list_error", {});
        console.log("Simulación de mensaje enviado:", { to: from, message: responseMessage });
      }
    } else {
      responseMessage = generateResponse("default", {});
      console.log("Simulación de mensaje enviado:", { to: from, message: responseMessage });
      console.error("Error al parsear el mensaje:", error.message);
    }
  }

  res.status(200).send();
});