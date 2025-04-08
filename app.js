"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./src/db");
const authRoutes_1 = __importDefault(require("./src/routes/authRoutes"));
const expenseRoutes_1 = __importDefault(require("./src/routes/expenseRoutes"));
const reminderRoutes_1 = __importDefault(require("./src/routes/reminderRoutes"));
const shoppingRoutes_1 = __importDefault(require("./src/routes/shoppingRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./src/routes/subscriptionRoutes"));
const userRoutes_1 = __importDefault(require("./src/routes/userRoutes"));
const validateTokenRoutes_1 = __importDefault(require("./src/routes/validateTokenRoutes"));
const webhookRoutes_1 = __importDefault(require("./src/routes/webhookRoutes"));
dotenv_1.default.config();
console.log("VERIFY_TOKEN cargado:", process.env.VERIFY_TOKEN);
const app = (0, express_1.default)();
// Conectar a MongoDB
(0, db_1.connectDB)();
// Middleware
app.use((0, cors_1.default)({ origin: "https://finanzapp-frontend.vercel.app" }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rutas
app.use("/api/auth", authRoutes_1.default);
app.use("/api/expenses", expenseRoutes_1.default);
app.use("/api/reminders", reminderRoutes_1.default);
app.use("/api/shopping-lists", shoppingRoutes_1.default);
app.use("/api/subscriptions", subscriptionRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/validate-token", validateTokenRoutes_1.default);
app.use("/api/webhook", webhookRoutes_1.default);
exports.default = app;
