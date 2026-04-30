// infrastructure/db/CompraDetailModel.js

const mongoose = require("mongoose");

const purchaseDetailSchema = new mongoose.Schema(
  {
    compraId:       { type: mongoose.Schema.Types.ObjectId, ref: "Compra", required: true },
    productoId:     { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    cantidad:       { type: Number, required: true },
    precioUnitario: { type: Number, required: true },
    subtotal:       { type: Number, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PurchaseDetail", purchaseDetailSchema);
