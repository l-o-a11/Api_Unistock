// infrastructure/db/OrderProcessModel.js
const mongoose = require("mongoose");

const orderProcessSchema = new mongoose.Schema(
  {
    id_detalle: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionOrderDetail", required: true },
    id_estado: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionState", required: true },
    fecha: { type: Date, default: Date.now },
    id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("OrderProcess", orderProcessSchema);
