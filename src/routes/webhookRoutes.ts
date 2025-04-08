// backend/src/routes/webhookRoutes.ts
import { Router } from "express";
import { verifyWebhook } from "../controllers/webhookController";
import { processMessage } from "../controllers/messageController";

const router = Router();

router.route("/verify")
  .get(verifyWebhook) // Verificación del webhook (GET)
  .post(processMessage); // Mensajes entrantes (POST) - Cambiamos handleIncomingMessage por processMessage

export default router;