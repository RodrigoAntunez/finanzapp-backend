// backend/src/controllers/expenseController.ts
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { Expense, IExpense } from "../models/Expense";
import { User, IUser } from "../models/User";
import { sendWhatsAppMessage } from "./messageController"; // Importa sendWhatsAppMessage
import mongoose from "mongoose";

// Obtener todos los gastos del usuario
export const getExpenses = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401);
    throw new Error("Usuario no autenticado");
  }

  const expenses: IExpense[] = await Expense.find({ user: userId }).populate("user", "whatsappNumber");

  // Crear un mensaje con la lista de gastos
  const expensesList = expenses.map(exp => `${exp.description || exp.category}: $${exp.amount}`).join("\n");
  const message = expenses.length > 0 ? `Tus gastos:\n${expensesList}` : "No tienes gastos registrados.";

  // Obtener el usuario para el número de WhatsApp
  let whatsappNumber: string | undefined;
  if (expenses.length > 0 && expenses[0].user) {
    const populatedUser = expenses[0].user as IUser; // Tipamos explícitamente como IUser
    whatsappNumber = populatedUser.whatsappNumber;
  } else {
    const user: IUser | null = await User.findById(userId); // Buscamos al usuario directamente
    whatsappNumber = user?.whatsappNumber;
  }

  // Ajustar el número de WhatsApp al formato internacional
  if (whatsappNumber && !whatsappNumber.startsWith("+")) {
    whatsappNumber = `+54${whatsappNumber}`; // Ajusta según el código de país
  }

  // Enviar el mensaje a WhatsApp
  if (whatsappNumber) {
    await sendWhatsAppMessage(whatsappNumber, message);
  } else {
    console.log("No se encontró un número de WhatsApp para enviar el mensaje.");
  }

  res.status(200).json({
    message: "Gastos obtenidos exitosamente",
    expenses,
  });
});

// Crear un nuevo gasto
// export const createExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
//   const { amount, category, description, shared, members, division, reminderDate } = req.body;
//   const userId = req.user?.id;

//   if (!userId) {
//     res.status(401);
//     throw new Error("Usuario no autenticado");
//   }

//   if (!amount || !category) {
//     res.status(400);
//     throw new Error("Por favor, proporciona el monto y la categoría");
//   }

//   const expense: IExpense = new Expense({
//     userId: new mongoose.Types.ObjectId(userId),
//     user: new mongoose.Types.ObjectId(userId),
//     amount,
//     category,
//     description,
//     shared: shared || false,
//     members: members ? members.map((id: string) => new mongoose.Types.ObjectId(id)) : [],
//     division,
//     reminderDate: reminderDate ? new Date(reminderDate) : undefined,
//     date: new Date(),
//   });

//   await expense.save();

//   await User.updateOne(
//     { _id: userId },
//     { $push: { expenses: expense._id } }
//   );

//   res.status(201).json({
//     message: "Gasto creado exitosamente",
//     expense,
//   });
// });
export const createExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  console.log("Solicitud recibida en POST /api/expenses:", req.body);
  console.log("Usuario autenticado:", req.user);

  const { amount, category, description, shared, members, division, reminderDate } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    console.log("Usuario no autenticado en POST /api/expenses");
    res.status(401);
    throw new Error("Usuario no autenticado");
  }

  if (!amount || !category) {
    console.log("Faltan campos requeridos en POST /api/expenses: amount y category son obligatorios");
    res.status(400);
    throw new Error("Por favor, proporciona el monto y la categoría");
  }

  console.log("Creando nuevo gasto con los datos:", { amount, category, description, userId });
  const expense: IExpense = new Expense({
    userId: new mongoose.Types.ObjectId(userId),
    user: new mongoose.Types.ObjectId(userId),
    amount,
    category,
    description,
    shared: shared || false,
    members: members ? members.map((id: string) => new mongoose.Types.ObjectId(id)) : [],
    division,
    reminderDate: reminderDate ? new Date(reminderDate) : undefined,
    date: new Date(),
  });

  console.log("Guardando gasto en la base de datos...");
  await expense.save();
  console.log("Gasto guardado exitosamente:", expense);

  console.log("Actualizando usuario con el nuevo gasto...");
  await User.updateOne(
    { _id: userId },
    { $push: { expenses: expense._id } }
  );
  console.log("Usuario actualizado exitosamente");

  res.status(201).json({
    message: "Gasto creado exitosamente",
    expense,
  });
});

// Actualizar un gasto
export const updateExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { expenseId } = req.params;
  const { amount, category, description, shared, members, division, reminderDate } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401);
    throw new Error("Usuario no autenticado");
  }

  const expense: IExpense | null = await Expense.findById(expenseId);
  if (!expense) {
    res.status(404);
    throw new Error("Gasto no encontrado");
  }

  if (expense.user.toString() !== userId) {
    res.status(403);
    throw new Error("No tienes permiso para actualizar este gasto");
  }

  if (amount) expense.amount = amount;
  if (category) expense.category = category;
  if (description) expense.description = description;
  if (shared !== undefined) expense.shared = shared;
  if (members) expense.members = members.map((id: string) => new mongoose.Types.ObjectId(id));
  if (division) expense.division = division;
  if (reminderDate) expense.reminderDate = new Date(reminderDate);

  await expense.save();

  res.status(200).json({
    message: "Gasto actualizado exitosamente",
    expense,
  });
});

// Eliminar un gasto
export const deleteExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { expenseId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401);
    throw new Error("Usuario no autenticado");
  }

  const expense: IExpense | null = await Expense.findById(expenseId);
  if (!expense) {
    res.status(404);
    throw new Error("Gasto no encontrado");
  }

  if (expense.user.toString() !== userId) {
    res.status(403);
    throw new Error("No tienes permiso para eliminar este gasto");
  }

  await expense.deleteOne();

  await User.updateOne(
    { _id: userId },
    { $pull: { expenses: expense._id } }
  );

  res.status(200).json({
    message: "Gasto eliminado exitosamente",
  });
});

// Compartir un gasto
export const shareExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { expenseId } = req.params;
  const { members } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401);
    throw new Error("Usuario no autenticado");
  }

  const expense: IExpense | null = await Expense.findById(expenseId);
  if (!expense) {
    res.status(404);
    throw new Error("Gasto no encontrado");
  }

  if (expense.user.toString() !== userId) {
    res.status(403);
    throw new Error("No tienes permiso para compartir este gasto");
  }

  expense.shared = true;
  expense.members = members ? members.map((id: string) => new mongoose.Types.ObjectId(id)) : [];
  await expense.save();

  // Verificamos si expense.members está definido y tiene elementos
  if (expense.members && expense.members.length > 0) {
    const message = `Hola, se ha compartido un gasto contigo: ${expense.description} por $${expense.amount}.`;
    console.log("Notificación enviada:", message);
  }

  res.status(200).json({
    message: "Gasto compartido exitosamente",
    expense,
  });
});