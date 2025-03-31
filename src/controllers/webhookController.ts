// backend/src/controllers/webhookController.ts
import { Request, Response, NextFunction } from "express";

export const verifyWebhook = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "GET") {
    // Verificación del webhook
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).json({ message: "Verificación fallida" });
    }
  } else if (req.method === "POST") {
    // Manejo de mensajes entrantes
    const body = req.body;

    // Verificar que el objeto sea de WhatsApp
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

    const from = message.from; // Número de teléfono del usuario
    const text = message.text?.body; // Texto del mensaje

    // Log para confirmar que el mensaje llegó
    console.log("Mensaje recibido de WhatsApp:", { from, text });

    // Responder con un mensaje simple (temporal)
    res.status(200).json({ message: "Mensaje recibido", from, text });
  } else {
    res.status(405).json({ message: "Método no soportado." });
  }
};