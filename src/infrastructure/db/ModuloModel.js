// infrastructure/db/ModuloModel.js

const mongoose = require("mongoose");

const moduloSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, lowercase: true },
    estado: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Modulo", moduloSchema);
