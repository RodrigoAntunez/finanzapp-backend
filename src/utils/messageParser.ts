// backend/src/utils/messageParser.ts
import { mapCategory, EXPENSE_CATEGORIES } from "./categoryMapper";

export interface ParsedMessage {
  type: string;
  data: any;
}

export const parseMessage = (message: string): ParsedMessage => {
  const lowerMessage = message.toLowerCase();

  // Comandos para gastos: "gaste", "gasto", "compre"
  const expenseCommands = ["gaste", "gasto", "compre"];
  if (expenseCommands.some((cmd) => lowerMessage.startsWith(cmd))) {
    // Aceptamos tanto "en" como "de" como conectores
    const match = lowerMessage.match(/(gaste|gasto|compre)\s+(\d+)\s+(en|de)\s+(.+)/i);
    if (match) {
      const amount = parseFloat(match[2]);
      const inputCategory = match[4].trim(); // El grupo 4 es la categoría después de "en" o "de"
      const category = mapCategory(inputCategory);
      return {
        type: "expense",
        data: { amount, category, description: inputCategory },
      };
    }
    throw new Error("Formato de gasto no reconocido. Usa: 'gaste 100 en comida' o 'compre 500 de pan'");
  }

  // Comandos para recordatorios: "recordame", "agenda"
  if (["recordame", "agenda"].some((cmd) => lowerMessage.startsWith(cmd))) {
    const match = lowerMessage.match(/(recordame|agenda)\s+(.+)\s+(mañana|hoy)/i);
    if (match) {
      const task = match[2];
      const time = match[3].toLowerCase();
      const date = time === "mañana" ? new Date(Date.now() + 24 * 60 * 60 * 1000) : new Date();
      return {
        type: "reminder",
        data: { task, time, date },
      };
    }
    throw new Error("Formato de recordatorio no reconocido. Usa: 'recordame comprar leche mañana'");
  }

  // Comandos para lista de compras: "lista de compras:", "compras:"
  if (lowerMessage.startsWith("lista de compras:") || lowerMessage.startsWith("compras:")) {
    const itemsText = lowerMessage.startsWith("lista de compras:")
      ? lowerMessage.replace(/lista de compras:/i, "").trim()
      : lowerMessage.replace(/compras:/i, "").trim();
    const items = itemsText.split(",").map((item) => item.trim()).filter((item) => item);
    if (items.length > 0) {
      return {
        type: "shopping_list",
        data: { items },
      };
    }
    throw new Error("Formato de lista de compras no reconocido. Usa: 'Lista de compras: manzanas, peras'");
  }

  // Comando: "resumen del mes"
  if (lowerMessage === "resumen del mes") {
    return {
      type: "summary_current_month",
      data: {},
    };
  }

  // Comando: "resumen del mes pasado"
  if (lowerMessage === "resumen del mes pasado") {
    return {
      type: "summary_last_month",
      data: {},
    };
  }

  // Comando: "mis recordatorios"
  if (lowerMessage === "mis recordatorios") {
    return {
      type: "pending_reminders",
      data: {},
    };
  }

  // Comando: "mis listas"
  if (lowerMessage === "mis listas") {
    return {
      type: "shopping_lists",
      data: {},
    };
  }

  // Comandos antiguos (para compatibilidad)
  if (lowerMessage.startsWith("recordatorio:")) {
    const reminderMatch = lowerMessage.match(/recordatorio:\s*(.+)\s+el\s+(\d{2}\/\d{2}\/\d{4})/i);
    if (reminderMatch) {
      const [, title, date] = reminderMatch;
      return {
        type: "reminder",
        data: { title, date, description: title, color: "blue" },
      };
    }
  } else if (lowerMessage.startsWith("gasto:")) {
    const expenseMatch = lowerMessage.match(/gasto:\s*(.+)\s+(\d+)/i);
    if (expenseMatch) {
      const [, description, amount] = expenseMatch;
      const category = mapCategory(description);
      return {
        type: "expense",
        data: { description, amount: parseFloat(amount), category },
      };
    }
  }

  throw new Error("Mensaje no reconocido");
};

// Función para clasificar categorías (mantenida para compatibilidad, pero ahora usamos mapCategory)
export const classifyCategory = (description: string): string => {
  return mapCategory(description);
};