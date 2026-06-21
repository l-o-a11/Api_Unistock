// infrastructure/db/ProductionOrderModel.js
const mongoose = require("mongoose");

const ESTADOS_VALIDOS = [
  "Diseño",
  "Ficha Técnica",
  "Corte",
  "Compras",
  "Producción",
  "Empaque",
  "Enviado",
  "Anulada",
];

const historialEntrySchema = new mongoose.Schema(
  {
    estado: { type: String, enum: ESTADOS_VALIDOS, required: true },
    fecha: { type: Date, default: Date.now },
    id_usuario: { type: mongoose.Schema.Types.Mixed, required: true },
    user: { type: String, default: null },
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
    id_usuario: { type: mongoose.Schema.Types.Mixed },
    estado: {
      type: String,
      enum: ESTADOS_VALIDOS,
      default: "Diseño",
    },
    motivo_anulacion: { type: String, default: null },
    tipo: { type: String, enum: ["produccion", "diseno"], default: "produccion" },
    techSpecification: { type: mongoose.Schema.Types.Mixed, default: null },
    designImages: { type: [String], default: [] },
    finishedImages: { type: [String], default: [] },
    finishedImageUrl: { type: String, default: null },
    fromDamaged: { type: Boolean, default: false },
    originalOrderNumber: { type: String, default: null },
    originalOrderStatus: { type: String, default: null },
    producto: { type: String, default: null },
    referencia: { type: String, default: null },
    // ✅ Antes estas asignaciones solo vivían en localStorage del navegador,
    // por lo que el dashboard (y cualquier otra vista) nunca podía leerlas
    // realmente desde el backend. Ahora se persisten en la orden.
    sedeAsignaciones:   { type: [mongoose.Schema.Types.Mixed], default: [] },
    terceroAsignaciones: { type: [mongoose.Schema.Types.Mixed], default: [] },
    historial: { type: [historialEntrySchema], default: [] },
  },
  { timestamps: true },
);

// Auto-incrementar numero_orden antes de guardar
productionOrderSchema.pre("save", async function () {
  if (this.isNew && !this.numero_orden) {
    const last = await this.constructor
      .findOne({}, { numero_orden: 1 })
      .sort({ numero_orden: -1 })
      .lean();
    this.numero_orden = last?.numero_orden ? last.numero_orden + 1 : 1;
  }
});

// Normalizar y validar los estados del historial antes de validar/guardar
productionOrderSchema.pre("validate", function () {
  if (!Array.isArray(this.historial)) {
    return;
  }

  const simpleNormalize = (str) =>
    String(str || "")
      .normalize("NFD")
      .replace(/[^\w\s]/g, "")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  for (let i = 0; i < this.historial.length; i++) {
    const entry = this.historial[i];
    if (!entry || !entry.estado) {
      throw new Error("[ProductionOrderModel] historial entry missing estado");
    }

    const match = ESTADOS_VALIDOS.find(
      (v) => simpleNormalize(v) === simpleNormalize(entry.estado),
    );

    if (!match) {
      throw new Error(`[ProductionOrderModel] historial.estado inválido: ${entry.estado}`);
    }

    // Assign the canonical enum label
    if (entry.estado !== match) {
      entry.estado = match;
    }
  }

  return;
});

module.exports = mongoose.model("ProductionOrder", productionOrderSchema);
