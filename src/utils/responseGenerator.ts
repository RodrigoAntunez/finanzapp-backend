// backend/src/utils/responseGenerator.ts

// URL de la página web de FinanzApp
const WEBSITE_URL = "https://finanzapp-frontend.vercel.app";

// Función para formatear fechas
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
};

// Función para generar respuestas personalizadas
export const generateResponse = (type: string, data: any): string => {
  switch (type) {
    case "expense":
      return (
        `✅ *Gasto registrado:*\n\n` +
        `💰 *Monto:* $${data.amount}\n` +
        `📁 *Categoría:* ${data.category}\n` +
        `📅 *Fecha:* ${formatDate(new Date())}\n\n` +
        `¿Quieres ver más detalles de tus finanzas? Visita nuestra web: ${WEBSITE_URL}`
      );
    case "expense_error":
      return (
        `❌ *Error al registrar el gasto:*\n\n` +
        `Por favor, usa el formato correcto: 'gaste $100 en comida'.\n\n` +
        `¿Necesitas ayuda? Visita nuestra web: ${WEBSITE_URL}`
      );
    case "reminder":
      return (
        `✅ *Recordatorio agendado:*\n\n` +
        `📅 *Tarea:* ${data.task}\n` +
        `⏰ *Momento:* ${data.time} (${formatDate(data.date)})\n` +
        `Te avisaré cuando llegue el momento.\n\n` +
        `¿Quieres gestionar tus recordatorios? Visita nuestra web: ${WEBSITE_URL}`
      );
    case "reminder_error":
      return (
        `❌ *Error al agendar el recordatorio:*\n\n` +
        `Por favor, usa el formato correcto: 'recordame comprar leche mañana'.\n\n` +
        `¿Necesitas ayuda? Visita nuestra web: ${WEBSITE_URL}`
      );
    case "shopping_list":
      return (
        `✅ *Lista de compras creada:*\n\n` +
        `🛒 *Ítems:* ${data.items.join(", ")}\n\n` +
        `¿Quieres ver todas tus listas de compras? Visita nuestra web: ${WEBSITE_URL}`
      );
    case "shopping_list_error":
      return (
        `❌ *Error al crear la lista de compras:*\n\n` +
        `Por favor, usa el formato correcto: 'Lista de compras: manzanas, peras, plátanos'.\n\n` +
        `¿Necesitas ayuda? Visita nuestra web: ${WEBSITE_URL}`
      );
    case "summary_current_month":
      return (
        `📊 *Resumen de tus gastos este mes:*\n\n` +
        `💸 *Total gastado:* $${data.total}\n` +
        `📅 *Mes:* ${data.month}\n\n` +
        (data.expenses.length > 0
          ? `Detalles:\n${data.expenses.map((exp: any) => `- ${exp.category}: $${exp.amount}`).join("\n")}\n\n`
          : "No tienes gastos registrados este mes.\n\n") +
        `¿Quieres analizar tus finanzas en detalle? Visita nuestra web: ${WEBSITE_URL}`
      );
    case "summary_last_month":
      const topCategory = data.topCategory
        ? `${data.topCategory.category} ($${data.topCategory.total})`
        : "Ninguna";
      return (
        `📊 *Resumen del mes pasado:*\n\n` +
        `💸 *Total gastado:* $${data.total}\n` +
        `📅 *Mes:* ${data.month}\n` +
        `🏆 *Categoría con más gastos:* ${topCategory}\n\n` +
        (data.expenses.length > 0
          ? `Detalles:\n${data.expenses.map((exp: any) => `- ${exp.category}: $${exp.amount}`).join("\n")}\n\n`
          : "No tienes gastos registrados el mes pasado.\n\n") +
        `¿Quieres analizar tus finanzas en detalle? Visita nuestra web: ${WEBSITE_URL}`
      );
    case "pending_reminders":
      return (
        `⏰ *Tus recordatorios pendientes:*\n\n` +
        (data.reminders.length > 0
          ? data.reminders
              .map(
                (rem: any, index: number) =>
                  `${index + 1}. ${rem.task} - ${rem.time} (${formatDate(rem.date)})`
              )
              .join("\n") + "\n\n"
          : "No tienes recordatorios pendientes.\n\n") +
        `¿Quieres gestionar tus recordatorios? Visita nuestra web: ${WEBSITE_URL}`
      );
    case "shopping_lists":
      return (
        `🛒 *Tus listas de compras:*\n\n` +
        (data.lists.length > 0
          ? data.lists
              .map(
                (list: any, index: number) =>
                  `${index + 1}. ${list.items
                    .map((item: any) => (item.purchased ? `✅ ${item.name}` : `⬜ ${item.name}`))
                    .join(", ")}`
              )
              .join("\n") + "\n\n"
          : "No tienes listas de compras.\n\n") +
        `¿Quieres gestionar tus listas de compras? Visita nuestra web: ${WEBSITE_URL}`
      );
    default:
      return (
        `👋 *¡Hola! No entendí tu mensaje.*\n\n` +
        `Prueba con:\n` +
        `- 'gaste $100 en comida'\n` +
        `- 'Lista de compras: manzanas, peras'\n` +
        `- 'recordame comprar leche mañana'\n` +
        `- 'resumen del mes'\n` +
        `- 'resumen del mes pasado'\n` +
        `- 'mis recordatorios'\n` +
        `- 'mis listas'\n\n` +
        `¿Necesitas ayuda? Visita nuestra web: ${WEBSITE_URL}`
      );
  }
};