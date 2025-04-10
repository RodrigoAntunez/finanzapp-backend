// // backend/src/config/db.ts
// import mongoose from "mongoose";

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/finanzapp");
//     console.log("MongoDB conectado");
//   } catch (err: any) {
//     console.error("Error al conectar a MongoDB:", err.message);
//     process.exit(1);
//   }
// };

// backend/src/config/db.ts
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI no está definida en las variables de entorno");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      connectTimeoutMS: 60000, // 60 segundos
      socketTimeoutMS: 60000, // 60 segundos
      serverSelectionTimeoutMS: 60000, // 60 segundos
      maxPoolSize: 10, // Número máximo de conexiones en el pool
      minPoolSize: 1, // Número mínimo de conexiones en el pool
      retryWrites: true, // Reintentar escrituras en caso de fallo
      w: "majority", // Estrategia de escritura
    });

    console.log("MongoDB conectado");
  } catch (err: any) {
    console.error("Error al conectar a MongoDB:", err.message);
    process.exit(1);
  }
};