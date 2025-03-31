// backend/src/routes/authRoutes.ts
import { Router } from "express";
import { login } from "../controllers/authController"; // Adjust based on your actual controller
import { authMiddleware } from "../middleware/auth"; // Should be correct

const router = Router();

router.post("/login", login);
// Add other auth routes as needed, e.g., router.get("/me", authMiddleware, getUser);

export default router;