// infrastructure/db/SedeModel.js

const mongoose = require("mongoose");

const sedeSchema = new mongoose.Schema(
  {
    nombre:    { type: String, required: true, unique: true },
    ciudad:    { type: String, required: true },
    barrio:    { type: String, required: true },
    direccion: { type: String, required: true },
    telefono:  { type: String, required: true },
    estado:    { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Sede", sedeSchema);
