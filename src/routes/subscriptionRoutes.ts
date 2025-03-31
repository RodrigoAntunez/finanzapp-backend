// import { Router } from "express";
// import { createSubscription } from "../controllers/subscriptionController";

// const router = Router();

// router.post("/create", createSubscription);

// export default router;

// backend/src/routes/subscriptionRoutes.ts
import { Router } from "express";
import { createSubscription, handleSubscriptionWebhook } from "../controllers/subscriptionController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Create a subscription (requires authentication)
router.post("/create", authMiddleware, createSubscription);

// Handle subscription webhook (e.g., from Mercado Pago or Stripe)
router.post("/webhook", handleSubscriptionWebhook);

export default router;
