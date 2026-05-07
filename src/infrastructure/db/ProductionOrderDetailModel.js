// infrastructure/db/ProductionOrderDetailModel.js
const mongoose = require("mongoose");

const productionOrderDetailSchema = new mongoose.Schema(
  {
    id_orden: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionOrder", required: true },
    // id_producto acepta strings de referencia (ej: "772", "CROP-TOP-01") O ObjectIds.
    // Se usa String para compatibilidad con el formulario del frontend que envía el código de referencia.
    id_producto: { type: String, required: true, trim: true },
    cantidad: { type: Number, required: true },
    color: { type: String },
    estado: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ProductionOrderDetail", productionOrderDetailSchema);
