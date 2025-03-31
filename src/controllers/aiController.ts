// src/controllers/aiController.ts
import { OpenAI } from "openai";
import { openai } from "../index"; // Importamos el cliente inicializado desde index.ts

export const getAIResponse = async (message: string, userName: string): Promise<string> => {
  const prompt = `Eres FinanzApp, un asistente financiero. El usuario se llama ${userName || "desconocido"}. Ayuda con gastos, recordatorios y listas de compras. Responde al mensaje: "${message}"`;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });

    if (
      completion.choices &&
      completion.choices.length > 0 &&
      completion.choices[0].message &&
      completion.choices[0].message.content
    ) {
      return completion.choices[0].message.content.trim();
    } else {
      return "Lo siento, no pude generar una respuesta válida.";
    }
  } catch (error) {
    console.error("Error al obtener respuesta de OpenAI:", error);
    return "Error al procesar tu solicitud. Intenta de nuevo más tarde.";
  }
};