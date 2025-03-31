import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const getAIResponse = async (message: string, userName: string) => {
  const prompt = `Eres FinanzApp, un asistente financiero. El usuario se llama ${userName || "desconocido"}. Ayuda con gastos, recordatorios y listas de compras. Responde al mensaje: "${message}"`;
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
  });
  return completion.data.choices[0].message.content.trim();
};