const mongoose = require("mongoose");
const suppliersSchema = new mongoose.Schema({
  nit: { type: Number, required: true, unique: true },
  nombre_de_empresa: { type: String, required: true },
  nombre_del_contacto: { type: String, required: true },
  direccion: { type: String, required: true },
  telefono: { type: Number, required: true },
  correo: { type: String, required: true, lowercase: true },
  sitio_web: { type: String },
  activo: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model("Suppliers", suppliersSchema);
