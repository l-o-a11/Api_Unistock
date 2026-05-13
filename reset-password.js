require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UserModel = require("./src/infrastructure/db/UserModel");

async function run() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error("Uso: node reset-password.js <correo> <nuevaPassword>");
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.DATABASE_NAME;
  if (!mongoUri || !dbName) {
    throw new Error("MONGO_URI o DATABASE_NAME no definidos en .env");
  }

  await mongoose.connect(mongoUri, {
    dbName,
  });

  const rounds = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);
  const hash = await bcrypt.hash(newPassword, rounds);

  const escapedEmail = email.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const result = await UserModel.updateOne(
    { correo: new RegExp(`^${escapedEmail}$`, "i") },
    { password: hash }
  );

  if (result.matchedCount === 0) {
    console.error(`No se encontró ningún usuario con correo ${email}. Prueba a verificar el correo exacto en la colección users.`);
    process.exit(1);
  }

  console.log(`Contraseña actualizada para ${email}`);
  console.log(`Usa esta contraseña para login: ${newPassword}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});