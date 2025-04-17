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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Manejar solicitudes OPTIONS explícitamente
app.options("*", (req: express.Request, res: express.Response) => {
  console.log(`Solicitud OPTIONS recibida para: ${req.originalUrl}`);
  res.status(200).end();
});

// Ruta de prueba en la raíz
app.get("/", (req, res) => {
  console.log("Solicitud recibida en /");
  res.status(200).json({ message: "Bienvenido a FinanzApp Backend" });
});

// Rutas de prueba (para depuración)
app.get("/api/auth/direct-test", (req, res) => {
  console.log("Solicitud recibida en /api/auth/direct-test");
  res.status(200).json({ message: "Ruta de prueba directa en /api/auth/direct-test" });
});

// Montar rutas directamente
console.log("Montando rutas...");
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

// Conectar a MongoDB de manera asíncrona
const initializeDB = async () => {
  try {
    console.log("Intentando conectar a MongoDB...");
    await connectDB();
    console.log("Conexión a MongoDB completada con éxito");
  } catch (err) {
    console.error("Error al conectar a MongoDB:", err);
  }
};

// Iniciar la conexión a MongoDB
initializeDB();

// Middleware de manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error no manejado:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Manejo de rutas no encontradas y errores 405
app.use((req: express.Request, res: express.Response) => {
  console.log(`Ruta no encontrada o método no permitido: ${req.method} ${req.originalUrl}`);
  res.status(405).json({ message: `Método ${req.method} no permitido para la ruta ${req.originalUrl}` });
});

export default app;