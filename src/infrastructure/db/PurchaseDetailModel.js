const mongoose = require("mongoose");

const purchaseDetailSchema = new mongoose.Schema({
    purchaseId: { type: Number, required: true },
    productoId: { type: Number, required: true },
    cantidad: { type: Number, required: true },
    precioUnitario: { type: Number, required: true },
    subtotal: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("PurchaseDetail", purchaseDetailSchema);
