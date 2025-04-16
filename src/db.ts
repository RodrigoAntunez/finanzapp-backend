import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI no está definida en las variables de entorno");
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "finanzapp", // Asegurar que se especifique la base de datos
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 60000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      w: "majority",
    });
    console.log("MongoDB conectado a la base de datos: finanzapp"); // Mensaje específico
  } catch (err: any) {
    console.error("Error al conectar a MongoDB:", err.message);
    throw err;
  }
};

export default mongoose;