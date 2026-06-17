// infrastructure/db/PurchaseModel.js

const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
    {
        // ID autoincremental legible — igual que numero_orden en ProductionOrderModel
        consecutivo: { type: Number, unique: true },
        fecha: { type: Date, required: true },
        proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: "Suppliers" },
        total: { type: Number, required: true },
        anulada: { type: Boolean, default: false },
        observaciones: { type: String },
        numeroFactura: { type: String, required: true, unique: true },
        motivoAnulacion: { type: String, default: null },
        fechaAnulacion: { type: Date, default: null },
    },
    { timestamps: true }
);

// ── Autoincremental ────────────────────────────────────────────────────────
// Mismo patrón que ProductionOrderModel.numero_orden.
// Busca el mayor consecutivo existente y suma 1.
// Si no hay ninguno, arranca en 1.
// El hook corre ANTES de guardar — si el save falla, el número no se "gasta".
purchaseSchema.pre("save", async function () {
    if (this.isNew && !this.consecutivo) {
        const last = await this.constructor
            .findOne({}, { consecutivo: 1 })
            .sort({ consecutivo: -1 })
            .lean();
        this.consecutivo = last?.consecutivo ? last.consecutivo + 1 : 1;
    }
});

module.exports = mongoose.model("Purchase", purchaseSchema);