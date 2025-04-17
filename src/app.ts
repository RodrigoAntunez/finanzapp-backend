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

// Middleware global
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "https://finanzapp-frontend.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba en la raíz
app.get("/", (req, res) => {
  res.status(200).json({ message: "Bienvenido a FinanzApp Backend" });
});

// Función asíncrona para configurar las rutas después de conectar
const setupRoutes = async () => {
  try {
    // Conectar a MongoDB y esperar a que se complete
    console.log("Intentando conectar a MongoDB...");
    await connectDB();
    console.log("Conexión a MongoDB completada en app.ts con éxito");

    // Rutas de prueba
    app.get("/api/auth/direct-test", (req, res) => {
      res.status(200).json({ message: "Ruta de prueba directa en /api/auth/direct-test" });
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
    // No salimos del proceso, permitimos que el servidor siga corriendo
    // y manejamos el error en las rutas
  }
};

// Iniciar la configuración de rutas
setupRoutes();

// Middleware de manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error no manejado:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Manejo de rutas no encontradas
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.originalUrl}` });
});

export default app;