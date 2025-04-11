// backend/src/routes/webhookRoutes.ts
import { Router } from "express";
import { verifyWebhook } from "../controllers/webhookController";

const router = Router();

// Manejar solicitudes POST al webhook
router.post("/verify", verifyWebhook);

export default router;