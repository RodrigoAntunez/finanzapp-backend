// backend/src/controllers/userController.ts
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { User, IUser } from "../models/User";
import { Expense } from "../models/Expense";
import { ShoppingItem } from "../models/ShoppingItem";
import jwt from "jsonwebtoken";

// Register a new user
export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { whatsappNumber, name } = req.body;

  if (!whatsappNumber) {
    res.status(400).json({ message: "El número de WhatsApp es requerido" });
    return;
  }

  let user: IUser | null = await User.findOne({ whatsappNumber });
  if (user) {
    res.status(400).json({ message: "El usuario ya existe" });
    return;
  }

  user = new User({
    whatsappNumber,
    name,
    messageCount: 0,
    expenses: [],
    shoppingLists: [],
    subscriptionStatus: "inactive",
  });

  await user.save();

  // Generate a JWT token for the user
  const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });

  res.status(201).json({
    id: user._id,
    whatsappNumber: user.whatsappNumber,
    name: user.name,
    token,
  });
});

// Validate a JWT token
export const validateToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer <token>"

  if (!token) {
    res.status(401).json({ message: "Token no proporcionado" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: string };
    const user: IUser | null = await User.findById(decoded.id);

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    res.status(200).json({
      id: user._id,
      whatsappNumber: user.whatsappNumber,
      name: user.name,
      subscriptionStatus: user.subscriptionStatus,
    });
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
    return;
  }
});

// Get user profile
export const getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Usuario no autenticado" });
    return;
  }

  const user: IUser | null = await User.findById(userId)
    .populate("expenses")
    .populate("shoppingLists");

  if (!user) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }

  res.status(200).json({
    id: user._id,
    whatsappNumber: user.whatsappNumber,
    name: user.name,
    expenses: user.expenses,
    shoppingLists: user.shoppingLists,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionId: user.subscriptionId,
    trialEndDate: user.trialEndDate,
    messageCount: user.messageCount,
  });
});

// Get user profile (simplified version)
export const getUserProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Usuario no autenticado" });
    return;
  }

  const user: IUser | null = await User.findById(userId);

  if (!user) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }

  res.status(200).json({
    id: user._id,
    whatsappNumber: user.whatsappNumber,
    name: user.name,
    subscriptionStatus: user.subscriptionStatus,
  });
});

// Update user name
export const updateUserName = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { name } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Usuario no autenticado" });
    return;
  }

  if (!name || typeof name !== "string") {
    res.status(400).json({ message: "El nombre es requerido y debe ser una cadena de texto" });
    return;
  }

  const user: IUser | null = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }

  user.name = name;
  await user.save();

  res.status(200).json({ message: "Nombre actualizado exitosamente", name: user.name });
  console.log("Respuesta enviada al cliente:", { message: "Nombre actualizado exitosamente", name: user.name });
});