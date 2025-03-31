// // backend/routes/expenses.ts
// import express from "express";
// import { Expense } from "../models/expense";
// import { auth } from "../middleware/auth";
// import { classifyCategory } from "../utils/messageParser";

// const router = express.Router();

// // Crear un nuevo gasto
// router.post("/", auth, async (req, res) => {
//   try {
//     const { description, category, amount, shared, members, division, reminderDate, date } = req.body as {
//       description: string;
//       category?: string;
//       amount: number;
//       shared?: boolean;
//       members?: string[];
//       division?: string;
//       reminderDate?: string;
//       date?: string;
//     };

//     // Clasificar la categoría automáticamente si no se proporciona
//     const finalCategory = category || classifyCategory(description);

//     const newExpense = new Expense({
//       userId: req.user.id,
//       description,
//       category: finalCategory,
//       amount,
//       shared: shared || false,
//       members: shared ? members : [],
//       division: shared ? division : null,
//       reminderDate: shared ? reminderDate : null,
//       date: date ? new Date(date) : new Date(),
//     });

//     const expense = await newExpense.save();
//     res.json(expense);
//   } catch (err: any) {
//     console.error(err.message);
//     res.status(500).send("Error del servidor");
//   }
// });

// // Obtener todos los gastos del usuario
// router.get("/", auth, async (req, res) => {
//   try {
//     const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
//     res.json(expenses);
//   } catch (err: any) {
//     console.error(err.message);
//     res.status(500).send("Error del servidor");
//   }
// });

// export default router;

// backend/routes/expenseRoutes.ts
// backend/src/routes/expenseRoutes.ts
// backend/src/routes/expenseRoutes.ts
// backend/src/routes/expenseRoutes.ts
// backend/src/routes/expenseRoutes.ts
// backend/src/routes/expenseRoutes.ts
// backend/src/routes/expenseRoutes.ts
// backend/src/routes/expenseRoutes.ts
// backend/src/routes/expenseRoutes.ts
// backend/src/routes/expenseRoutes.ts
import { Router } from "express";
import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  shareExpense,
} from "../controllers/expenseController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, createExpense);
router.get("/", authMiddleware, getExpenses);
router.put("/:id", authMiddleware, updateExpense);
router.delete("/:id", authMiddleware, deleteExpense);
router.post("/share/:id", authMiddleware, shareExpense);

export default router;
