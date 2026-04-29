// infrastructure/db/PrivilegioModel.js

const mongoose = require("mongoose");

const privilegioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, lowercase: true },
    estado: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Privilegio", privilegioSchema);
