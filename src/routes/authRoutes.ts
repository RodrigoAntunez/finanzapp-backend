// backend/src/routes/authRoutes.ts
import { Router } from "express";
import { login, register } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
console.log("Configurando rutas de autenticación...");

router.post("/login", login);
router.post("/register", register);
// Add other auth routes as needed, e.g., router.get("/me", authMiddleware, getUser);

export default router;