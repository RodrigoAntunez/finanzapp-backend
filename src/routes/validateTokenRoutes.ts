// backend/src/routes/validateTokenRoutes.ts
import { Router, RequestHandler } from "express";
import { validateToken } from "../controllers/validateTokenController";

const router = Router();

const validateTokenHandler: RequestHandler = validateToken;

router.get("/", validateTokenHandler);

export default router;