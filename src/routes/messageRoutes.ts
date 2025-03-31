// backend/src/routes/messageRoutes.ts
import { Router } from "express";
import { handleIncomingMessage } from "../controllers/messageController";

const router = Router();

router.route("/incoming").get(handleIncomingMessage).post(handleIncomingMessage);

export default router;