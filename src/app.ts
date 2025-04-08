// src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db";
import authRoutes from "./routes/authRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import reminderRoutes from "./routes/reminderRoutes";
import shoppingRoutes from "./routes/shoppingRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import userRoutes from "./routes/userRoutes";
import validateTokenRoutes from "./routes/validateTokenRoutes";
import webhookRoutes from "./routes/webhookRoutes";

dotenv.config();
console.log("VERIFY_TOKEN cargado:", process.env.VERIFY_TOKEN);

const app = express();

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors({ origin: "https://finanzapp-frontend.vercel.app" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/shopping-lists", shoppingRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/validate-token", validateTokenRoutes);
app.use("/api/webhook", webhookRoutes);

export default app;