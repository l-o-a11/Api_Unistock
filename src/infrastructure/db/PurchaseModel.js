// infrastructure/db/CompraModel.js

const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
    fecha: { type: Date, required: true },
    proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    total: { type: Number, required: true },
    anulada: { type: Boolean, default: false },
    observaciones: { type: String, required: false },
    numeroFactura: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Purchase", purchaseSchema);