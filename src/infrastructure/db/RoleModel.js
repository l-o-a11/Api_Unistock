// infrastructure/db/RoleModel.js

const mongoose = require("mongoose");

// Subdocumento: cada permiso tiene un módulo y sus privilegios
const permisoSchema = new mongoose.Schema(
  {
    modulo: { type: String, required: true, trim: true },
    privilegios: { type: [String], required: true, default: [] },
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    estado: { type: Boolean, default: true },
    permisos: { type: [permisoSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);