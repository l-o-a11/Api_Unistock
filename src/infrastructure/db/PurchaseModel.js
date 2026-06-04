// infrastructure/db/PurchaseModel.js

const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
    {
        fecha: { type: Date, required: true },
        proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: "Suppliers" },
        total: { type: Number, required: true },
        anulada: { type: Boolean, default: false },
        observaciones: { type: String },
        numeroFactura: { type: String, required: true, unique: true },
        // ── Anulación ──────────────────────────────────────────────────────────
        motivoAnulacion: { type: String, default: null },
        fechaAnulacion: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);