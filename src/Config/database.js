// Config/database.js
const mongoose = require("mongoose");

const connectDatabase = async () => {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DATABASE_NAME || "Unistock";

  await mongoose.connect(uri, { dbName });
  console.log(` MongoDB conectado → ${dbName}`);
};

module.exports = { connectDatabase };
