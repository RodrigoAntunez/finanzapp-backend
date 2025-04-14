// // backend/src/utils/whatsapp.ts
// import { Reminder, IReminder } from "../models/Reminder";
// import { Expense, IExpense } from "../models/Expense";
// import { parseMessage, ParsedMessage } from "./messageParser";
// import { classifyCategory } from "./messageParser"; // Añadido

// export const processWhatsAppMessage = async (message: string, userId: string): Promise<ParsedMessage> => {
//   try {
//     const parsed = parseMessage(message);

//     if (parsed.type === "reminder") {
//       const { title, description, date, color } = parsed.data;
//       const newReminder = new Reminder({
//         userId,
//         title,
//         description,
//         date,
//         color,
//       });
//       const savedReminder = await newReminder.save();
//       return { type: "reminder", data: savedReminder };
//     } else if (parsed.type === "expense") {
//       const { description, amount } = parsed.data;
//       const category = classifyCategory(description);
//       const newExpense = new Expense({
//         userId,
//         description,
//         category,
//         amount,
//         date: new Date(),
//       });
//       const savedExpense = await newExpense.save();
//       return { type: "expense", data: savedExpense };
//     }

//     throw new Error("Tipo de mensaje no soportado");
//   } catch (err: any) {
//     throw new Error(err.message || "Error al procesar el mensaje de WhatsApp");
//   }
// };

// backend/src/utils/whatsapp.ts
import axios from "axios";

export const sendMessage = async (to: string, message: string) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
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
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error al enviar mensaje de WhatsApp:", error);
    throw new Error("No se pudo enviar el mensaje de WhatsApp");
  }
};