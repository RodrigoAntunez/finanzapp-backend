import express from "express";
import { login, register } from "../controllers/authController";

const router = express.Router();

// Rutas de autenticación
router.post("/login", login);
console.log("Ruta POST /login definida");
router.post("/register", register);
console.log("Ruta POST /register definida");

// Ruta de prueba (para depuración)
router.get("/test", (req: express.Request, res: express.Response) => {
  res.status(200).json({ message: "Ruta de prueba en /api/auth/test" });
});
console.log("Ruta GET /test definida");

export default router;