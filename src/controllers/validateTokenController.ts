// backend/src/controllers/validateTokenController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

interface DecodedToken {
  id: string;
}

export const validateToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({ msg: "Token no proporcionado" });
      return;
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as DecodedToken;

    // Buscar al usuario en la base de datos
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(404).json({ msg: "Usuario no encontrado" });
      return;
    }

    // Devolver los datos del usuario
    res.status(200).json({
      id: user._id,
      name: user.name,
      whatsappNumber: user.whatsappNumber,
      messageCount: user.messageCount,
      trialEndDate: user.trialEndDate,
      subscriptionStatus: user.subscriptionStatus,
    });
  } catch (error: any) {
    console.error("Error al validar el token:", error);
    if (error.name === "JsonWebTokenError") {
      res.status(401).json({ msg: "Token inválido" });
      return;
    }
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ msg: "Token expirado" });
      return;
    }
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};