// backend/src/routes/webhookRoutes.ts
import { Router } from "express";
import { verifyWebhook } from "../controllers/webhookController";

const router = Router();

// Manejar solicitudes POST al webhook
router.post("/verify", verifyWebhook);

// Manejar solicitudes GET para la verificación del webhook
router.get("/verify", (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN; // Token de verificación configurado en WhatsApp

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === verifyToken) {
    console.log("Webhook verificado exitosamente");
    res.status(200).send(challenge);
  } else {
    console.log("Fallo en la verificación del webhook");
    res.sendStatus(403);
  }
});

export default router;