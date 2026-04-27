// infrastructure/db/ProductionOrderDetailModel.js
const mongoose = require("mongoose");

const productionOrderDetailSchema = new mongoose.Schema(
  {
    id_orden: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionOrder", required: true },
    id_producto: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    cantidad: { type: Number, required: true },
    color: { type: String },
    estado: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ProductionOrderDetail", productionOrderDetailSchema);
