// infrastructure/db/SupplyModel.js

const mongoose = require("mongoose");

/**
 * Sub-esquema para propiedades del insumo.
 * valor se normaliza (mayúscula inicial, resto minúscula) en el controller.
 */
const propiedadSchema = new mongoose.Schema(
  {
    clave: { type: String, required: true },   // ej: "color", "material"
    label: { type: String, required: true },   // ej: "Color", "Material"
    valor: { type: String, required: true },   // ej: "Rojo", "Algodón"
  },
  { _id: false },
);

const supplySchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, },
    categoria: {type: mongoose.Schema.Types.ObjectId,ref: "SupplyCategory", required: true, },
    stock: {type: Number,default: 0, min: 0,},
    valor_medida: { type: Number, min: 0, },
    medida: { type: String, trim: true, },
    // ── NUEVO ──────────────────────────────────────────────────────
    imagen: { type: String, default: null },           // URL pública de Cloudinary
    imagenPublicId: { type: String, default: null },   // Para poder eliminarla

    estado: {type: Boolean, default: true, },
    /**
     * Al menos 1 propiedad requerida — validado en el controller/middleware,
     * no a nivel de esquema para permitir flexibilidad en updates parciales.
     */
    propiedades: {type: [propiedadSchema],  default: [], },

  },
  { timestamps: true },
);

/**
 * Índice compuesto: no puede existir dos insumos con el mismo nombre
 * dentro de la misma categoría (duplicado de negocio).
 */
supplySchema.index({ nombre: 1, categoria: 1 }, { unique: true });

module.exports = mongoose.model("Supply", supplySchema);