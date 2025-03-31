// backend/src/routes/reminderRoutes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth"; // Update to import authMiddleware

const router = Router();

// Example route (adjust based on your actual implementation)
router.get("/", authMiddleware, (req, res) => {
  res.status(200).json({ msg: "Reminder route" });
});

export default router;