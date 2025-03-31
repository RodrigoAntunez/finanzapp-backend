// backend/src/controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

// Ejemplo de controlador de login
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { whatsappNumber } = req.body;

  if (!whatsappNumber) {
    res.status(400);
    throw new Error("Por favor, proporciona un número de WhatsApp");
  }

  // Buscar o crear un usuario
  let user: IUser | null = await User.findOne({ whatsappNumber });
  if (!user) {
    user = new User({
      whatsappNumber,
      messageCount: 0,
      expenses: [],
      shoppingLists: [],
      subscriptionStatus: "inactive",
    });
    await user.save();
  }

  // Generar un token JWT (o cualquier otro tipo de token)
  const token = jwt.sign(
    { id: user._id, whatsappNumber: user.whatsappNumber },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "30d" }
  );

  // Asignar el token al usuario
  user.accessToken = token;
  await user.save();

  // Responder con el token
  res.status(200).json({
    message: "Login exitoso",
    token,
    user: {
      id: user._id,
      whatsappNumber: user.whatsappNumber,
    },
  });
});