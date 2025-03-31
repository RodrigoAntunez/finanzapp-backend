// backend/src/routes/userRoutes.ts
import { Router } from "express";
import { registerUser, validateToken, getUser, getUserProfile, updateUserName } from "../controllers/userController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Register a new user (no authentication required)
router.post("/register", registerUser);

// Validate a JWT token (no authentication required)
router.post("/validate-token", validateToken);

// Get user profile (requires authentication)
router.get("/me", authMiddleware, getUser);

// Get simplified user profile (requires authentication)
router.get("/profile", authMiddleware, getUserProfile);

// Update user name (requires authentication)
router.put("/name", authMiddleware, updateUserName);

export default router;