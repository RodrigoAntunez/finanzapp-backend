// backend/src/routes/whatsapp.ts
import express from "express";
import { auth } from "../middleware/auth";
import { processMessage } from "../controllers/messageController";

const router = express.Router();

router.post("/message", auth, processMessage);

export default router;