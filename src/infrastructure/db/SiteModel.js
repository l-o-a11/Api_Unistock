// infrastructure/db/SiteModel.js
// FIX #5 (API): telefono cambiado a String para aceptar formatos colombianos
// (ej: "604-234-5678", "3101234567") sin perder ceros iniciales.
// Esto es consistente con lo que los use-cases ya hacían: String(telefono).trim()

const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema(
  {
    nombre:    { type: String, required: true, unique: true, trim: true },
    ciudad:    { type: String, required: true, trim: true },
    barrio:    { type: String, required: true, trim: true },
    direccion: { type: String, required: true, trim: true },
    // FIX #5: era Number — trim es inválido en Number y se pierden ceros iniciales
    telefono:  { type: String, required: true, trim: true },
    estado:    { type: Boolean, default: true },
  },
  { timestamps: true },
);

// FIX #6: nombre del modelo unificado como "Sede" (igual que BACKEND)
// La colección en MongoDB será "sedes" en ambos servicios
module.exports = mongoose.model("site", siteSchema);
