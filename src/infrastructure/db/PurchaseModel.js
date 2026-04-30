const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
    fecha: { type: Date, required: true },
    proveedorId: { type: Number, required: true },
    total: { type: Number, required: true },
    estado: { type: Boolean, default: true },
    observaciones: { type: String, required: false },
    numeroFactura: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Purchase", purchaseSchema);
