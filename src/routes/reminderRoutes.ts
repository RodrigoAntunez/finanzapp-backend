// backend/src/routes/reminderRoutes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getReminders, createReminder } from "../controllers/reminderController";

const router = Router();

// Obtener todos los recordatorios del usuario
router.get("/", authMiddleware, getReminders);

// Crear un nuevo recordatorio
router.post("/", authMiddleware, createReminder);

export default router;