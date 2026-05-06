// infrastructure/db/ProductionOrderModel.js
const mongoose = require("mongoose");

const ESTADOS_VALIDOS = [
  "Diseño",
  "Ficha Técnica",
  "Corte",
  "Compras",
  "Producción",
  "Anulada",
];

const historialEntrySchema = new mongoose.Schema(
  {
    estado: { type: String, enum: ESTADOS_VALIDOS, required: true },
    fecha: { type: Date, default: Date.now },
    id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    motivo: { type: String, default: null },
  },
  { _id: false },
);

const productionOrderSchema = new mongoose.Schema(
  {
    numero_orden: { type: Number, unique: true },
    fecha_creacion: { type: Date, default: Date.now },
    fecha_entrega: { type: Date, required: true },
    cliente: { type: String, required: true },
    id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    estado: {
      type: String,
      enum: ESTADOS_VALIDOS,
      default: "Diseño",
    },
    motivo_anulacion: { type: String, default: null },
    historial: { type: [historialEntrySchema], default: [] },
  },
  { timestamps: true },
);

// Auto-incrementar numero_orden antes de guardar
productionOrderSchema.pre("save", async function (next) {
  if (this.isNew && !this.numero_orden) {
    const last = await this.constructor
      .findOne({}, { numero_orden: 1 })
      .sort({ numero_orden: -1 })
      .lean();
    this.numero_orden = last?.numero_orden ? last.numero_orden + 1 : 1;
  }
  next();
});

module.exports = mongoose.model("ProductionOrder", productionOrderSchema);
