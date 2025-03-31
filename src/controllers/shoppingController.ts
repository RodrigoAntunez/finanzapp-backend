// backend/src/controllers/shoppingController.ts
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { ShoppingItem, IShoppingItem } from "../models/ShoppingItem";
import { User, IUser } from "../models/User";
import mongoose from "mongoose";

// Crear una nueva lista de compras
export const createShoppingList = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { items } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401);
    throw new Error("Usuario no autenticado");
  }

  if (!items || !Array.isArray(items)) {
    res.status(400);
    throw new Error("Por favor, proporciona una lista de ítems");
  }

  const shoppingItem: IShoppingItem = new ShoppingItem({
    userId: new mongoose.Types.ObjectId(userId),
    user: new mongoose.Types.ObjectId(userId), // Asignamos el mismo userId a user
    items: items.map((item: string) => ({ name: item, purchased: false })),
  });

  await shoppingItem.save();

  await User.updateOne(
    { _id: userId },
    { $push: { shoppingLists: shoppingItem._id } }
  );

  res.status(201).json({
    message: "Lista de compras creada exitosamente",
    shoppingList: shoppingItem,
  });
});

// Actualizar una lista de compras
export const updateShoppingList = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { shoppingListId } = req.params;
  const { items } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401);
    throw new Error("Usuario no autenticado");
  }

  const shoppingItem: IShoppingItem | null = await ShoppingItem.findById(shoppingListId);
  if (!shoppingItem) {
    res.status(404);
    throw new Error("Lista de compras no encontrada");
  }

  if (shoppingItem.user.toString() !== userId) {
    res.status(403);
    throw new Error("No tienes permiso para actualizar esta lista de compras");
  }

  if (items) {
    shoppingItem.items = items.map((item: { name: string; purchased: boolean }) => ({
      name: item.name,
      purchased: item.purchased ?? false,
    }));
  }

  await shoppingItem.save();

  res.status(200).json({
    message: "Lista de compras actualizada exitosamente",
    shoppingList: shoppingItem,
  });
});

// Eliminar una lista de compras
export const deleteShoppingList = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { shoppingListId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401);
    throw new Error("Usuario no autenticado");
  }

  const shoppingItem: IShoppingItem | null = await ShoppingItem.findById(shoppingListId);
  if (!shoppingItem) {
    res.status(404);
    throw new Error("Lista de compras no encontrada");
  }

  if (shoppingItem.user.toString() !== userId) {
    res.status(403);
    throw new Error("No tienes permiso para eliminar esta lista de compras");
  }

  await shoppingItem.deleteOne();

  await User.updateOne(
    { _id: userId },
    { $pull: { shoppingLists: shoppingItem._id } }
  );

  res.status(200).json({
    message: "Lista de compras eliminada exitosamente",
  });
});