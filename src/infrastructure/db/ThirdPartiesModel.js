const mongoose = require("mongoose");
const thirdPartiesSchema = new mongoose.Schema({
  // Campos obligatorios
  nit: { type: String, required: true },
  nombre_empresa: { type: String, required: true },
  nombre_contacto: { type: String, required: true },
  
  // Campos básicos (compatibilidad)
  nombre: { type: String }, // Alias para nombre_empresa
  contacto: { type: String }, // Alias para nombre_contacto
  
  // Información de contacto
  correo_empresa: { type: String },
  correo_contacto: { type: String },
  telefono: { type: String, required: true },
  
  // Ubicación
  direccion: { type: String, required: true },
  barrio: { type: String },
  
  // Identificación
  codigo_tercero: { type: String, unique: true, sparse: true }, // Auto-generado si no existe
  codigo: { type: String, unique: true, sparse: true },
  
  // Web
  sitio_web: { type: String },
  
  // Estado
  estado: { type: Boolean, default: true },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("ThirdParties", thirdPartiesSchema);
