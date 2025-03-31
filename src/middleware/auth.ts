// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

interface DecodedToken {
  id: string;
}

export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  console.log("Headers recibidos en authMiddleware:", req.headers);

  const token = req.headers.authorization?.split(" ")[1]; // Espera "Bearer <token>"
  console.log("Token extraído:", token);

  if (!token) {
    console.log("Token no proporcionado");
    res.status(401).json({ message: "Token no proporcionado" });
    return;
  }

  // Intentar verificar el token con JWT
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as DecodedToken;
    req.user = { id: decoded.id };
    console.log("Usuario autenticado (JWT):", req.user);
    next();
  } catch (jwtError) {
    console.log("Token JWT inválido, verificando en la base de datos...");
    const user = await mongoose.model("User").findOne({ accessToken: token });

    if (!user) {
      console.log("Usuario no encontrado");
      res.status(401).json({ message: "Usuario no encontrado" });
      return;
    }

    req.user = { id: user._id.toString() }; // Convertir ObjectId a string
    console.log("Usuario autenticado (DB):", req.user);
    next();
  }
});

// Extender el tipo Request para incluir req.user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}