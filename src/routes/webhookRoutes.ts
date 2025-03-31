// backend/src/routes/webhookRoutes.ts
import { Router } from "express";
import { verifyWebhook } from "../controllers/webhookController";
import { handleIncomingMessage } from "../controllers/messageController";

const router = Router();

router.route("/verify")
  .get(verifyWebhook) // Verificación del webhook (GET)
  .post(handleIncomingMessage); // Mensajes entrantes (POST)

export default router;