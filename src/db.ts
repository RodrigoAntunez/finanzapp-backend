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
      dbName: "finanzapp",
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 60000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      w: "majority",
    });

    console.log("MongoDB conectado a la base de datos: finanzapp");
  } catch (err: any) {
    console.error("Error al conectar a MongoDB:", err.message);
    process.exit(1);
  }
};