require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UserModel = require("./src/infrastructure/db/UserModel");

async function run() {
  const [email, fullName, tipoDocumento, numeroDocumento, rolId, sedeId, password] = process.argv.slice(2);

  if (!email || !fullName || !tipoDocumento || !numeroDocumento || !rolId || !sedeId || !password) {
    console.error("Uso: node create-user-direct.js <correo> <nombreCompleto> <tipoDocumento> <numeroDocumento> <rolId> <sedeId> <password>");
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.DATABASE_NAME;
  if (!mongoUri || !dbName) {
    throw new Error("MONGO_URI o DATABASE_NAME no definidos en .env");
  }

  await mongoose.connect(mongoUri, { dbName });

  const rounds = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);
  const hash = await bcrypt.hash(password, rounds);

  const existing = await UserModel.findOne({ correo: new RegExp(`^${email}$`, "i") });
  if (existing) {
    console.error(`Ya existe un usuario con correo ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const user = await UserModel.create({
    tipoDocumento,
    numeroDocumento,
    nombreCompleto: fullName,
    correo: email,
    password: hash,
    rolId,
    sedeId,
    estado: true,
  });

  console.log("Usuario creado:");
  console.log({
    id: user._id.toString(),
    correo: user.correo,
    nombreCompleto: user.nombreCompleto,
    tipoDocumento: user.tipoDocumento,
    numeroDocumento: user.numeroDocumento,
    rolId: user.rolId,
    sedeId: user.sedeId,
    estado: user.estado,
  });
  console.log(`Contraseña para login: ${password}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});