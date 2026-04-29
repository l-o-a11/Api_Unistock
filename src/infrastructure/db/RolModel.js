// infrastructure/db/RolModel.js

const mongoose = require("mongoose");

const rolSchema = new mongoose.Schema(
  {
    nombre:      { type: String, required: true, unique: true },
    descripcion: { type: String, required: true },
    estado:      { type: Boolean, default: true },
    permisos:    { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Rol", rolSchema);
