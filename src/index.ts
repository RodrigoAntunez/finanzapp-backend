// // backend/src/index.ts
// import dotenv from "dotenv";
// dotenv.config();

// import {connectDB} from "./db";
// import express from "express";
// import cors from "cors";
// import expenseRoutes from "./routes/expenseRoutes";
// import remindersRoutes from "./routes/reminderRoutes";
// import messageRoutes from "./routes/messageRoutes";
// import shoppingRoutes from "./routes/shoppingRoutes";
// import subscriptionRoutes from "./routes/subscriptionRoutes";
// import userRoutes from "./routes/userRoutes";
// import whatsappRoutes from "./routes/whatsapp";
// import validateTokenRoutes from "./routes/validateTokenRoutes";

// const app = express();

// // Conectar a la base de datos
// connectDB();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Rutas
// app.use("/api/expenses", expenseRoutes);
// app.use("/api/reminders", remindersRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/shopping", shoppingRoutes);
// app.use("/api/subscriptions", subscriptionRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/whatsapp", whatsappRoutes);
// app.use("/api/validate-token", validateTokenRoutes);

// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => console.log(`Servidor iniciado en el puerto ${PORT}`));
// backend/src/index.ts
// backend/src/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db"; // Cambiado de `import connectDB from "./db"`
import authRoutes from "./routes/authRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import messageRoutes from "./routes/messageRoutes";
import reminderRoutes from "./routes/reminderRoutes";
import shoppingRoutes from "./routes/shoppingRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import userRoutes from "./routes/userRoutes";
import validateTokenRoutes from "./routes/validateTokenRoutes";
import webhookRoutes from "./routes/webhookRoutes"

dotenv.config();
console.log("VERIFY_TOKEN cargado:", process.env.VERIFY_TOKEN);

const app = express();
const PORT = process.env.PORT || 5001;

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para procesar los datos del webhook

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/shopping-lists", shoppingRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/validate-token", validateTokenRoutes);
app.use("/api/webhook", webhookRoutes);

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});