// backend/src/config/db.ts
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/finanzapp");
    console.log("MongoDB conectado");
  } catch (err: any) {
    console.error("Error al conectar a MongoDB:", err.message);
    process.exit(1);
  }
};