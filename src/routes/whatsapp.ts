// backend/src/routes/whatsapp.ts
import express from "express";
import { authMiddleware } from "../middleware/auth";
import { processMessage } from "../controllers/messageController";

const router = express.Router();

router.post("/message", authMiddleware, processMessage);

export default router;