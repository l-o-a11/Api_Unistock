import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI no definido en .env");

    await mongoose.connect(uri);
    console.log("Conectado a MongoDB");
  } catch (err) {
    console.error("Error de conexión:", err.message);
    process.exit(1);
  }
};


export default connectDB;