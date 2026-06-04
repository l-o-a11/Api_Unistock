// infrastructure/db/PurchaseDetailModel.js

const mongoose = require("mongoose");

const purchaseDetailSchema = new mongoose.Schema(
  {
    compraId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", required: true },
    // Puede venir un producto terminado o un insumo — uno de los dos es obligatorio
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    insumoId: { type: mongoose.Schema.Types.ObjectId, ref: "Supply", default: null },
    // Nombre libre para cuando no hay referencia en catálogo todavía
    nombre: { type: String, default: null },
    cantidad: { type: Number, required: true },
    precioUnitario: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseDetail", purchaseDetailSchema);