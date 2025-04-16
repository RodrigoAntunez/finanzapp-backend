import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import shoppingRoutes from "./routes/shoppingRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import validateTokenRoutes from "./routes/validateTokenRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

dotenv.config();
console.log("VERIFY_TOKEN cargado:", process.env.VERIFY_TOKEN);

const app = express();

// Middleware global (no depende de la conexión)
app.use(cors({ origin: "https://finanzapp-frontend.vercel.app" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Función asíncrona para configurar las rutas después de conectar
const setupRoutes = async () => {
  try {
    // Conectar a MongoDB y esperar a que se complete
    await connectDB();
    console.log("Conexión a MongoDB completada en app.ts"); // Añadir este log si no está

    // Rutas de prueba
    app.get("/api/auth/direct-test", (req, res) => {
      res.status(200).json({ message: "Ruta de prueba directa en /api/auth/direct-test" });
    });

    app.get("/", (req, res) => {
      res.status(200).json({ message: "Bienvenido a FinanzApp Backend" });
    });

    // Montar rutas
    app.use("/api/auth", authRoutes);
    console.log("Rutas de autenticación montadas en /api/auth");
    app.use("/api/expenses", expenseRoutes);
    console.log("Rutas de gastos montadas en /api/expenses");
    app.use("/api/reminders", reminderRoutes);
    console.log("Rutas de recordatorios montadas en /api/reminders");
    app.use("/api/shopping-lists", shoppingRoutes);
    console.log("Rutas de listas de compras montadas en /api/shopping-lists");
    app.use("/api/subscriptions", subscriptionRoutes);
    console.log("Rutas de suscripciones montadas en /api/subscriptions");
    app.use("/api/users", userRoutes);
    console.log("Rutas de usuarios montadas en /api/users");
    app.use("/api/validate-token", validateTokenRoutes);
    console.log("Rutas de validate-token montadas en /api/validate-token");
    app.use("/api/webhook", webhookRoutes);
    console.log("Rutas de webhook montadas en /api/webhook");
  } catch (err) {
    console.error("Error al configurar las rutas:", err);
    process.exit(1); // Salir si falla la conexión
  }
};

// Iniciar la configuración de rutas
setupRoutes();

// Exportar la app (Vercel la usará)
export default app;