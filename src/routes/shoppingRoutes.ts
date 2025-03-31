// backend/src/routes/shoppingRoutes.ts
import { Router } from "express";
import {
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
} from "../controllers/shoppingController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", createShoppingList); // No requiere autenticación por ahora
router.put("/:id", authMiddleware, updateShoppingList);
router.delete("/:id", authMiddleware, deleteShoppingList);

export default router;