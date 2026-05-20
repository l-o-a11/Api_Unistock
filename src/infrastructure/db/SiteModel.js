// infrastructure/db/SiteModel.js
//POR AHORA NUMBER, LUEGO SE PUEDE CAMBIAR A STRING PARA PERMITIR FORMATO DE TELÉFONO MÁS FLEXIBLE (CON GUIONES, ESPACIOS, ETC). SI SE CAMBIA A STRING, HAY QUE VALIDAR QUE SOLO CONTENGA NÚMEROS Y CARACTERES PERMITIDOS.

const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema(
  {
    nombre:    { type: String, required: true, unique: true },
    ciudad:    { type: String, required: true },
    barrio:    { type: String, required: true },
    direccion: { type: String, required: true },
    telefono:  { type: Number, required: true },
    estado:    { type: Boolean, default: true },
  },
  { timestamps: true },
);


module.exports = mongoose.model("Sede", siteSchema);
