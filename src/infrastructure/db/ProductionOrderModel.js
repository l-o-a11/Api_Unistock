// infrastructure/db/ProductionOrderModel.js
const mongoose = require("mongoose");

const productionOrderSchema = new mongoose.Schema(
  {
    fecha_creacion: { type: Date, default: Date.now },
    fecha_entrega: { type: Date, required: true },
    cliente: { type: String, required: true },
    id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ProductionOrder", productionOrderSchema);
