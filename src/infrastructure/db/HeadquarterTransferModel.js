// infrastructure/db/HeadquarterTransferModel.js
const mongoose = require("mongoose");

const headquarterTransferSchema = new mongoose.Schema(
  {
    id_orden: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionOrder", required: true },
    id_sede_origen: { type: mongoose.Schema.Types.ObjectId, ref: "Headquarters", required: true },
    id_sede_destino: { type: mongoose.Schema.Types.ObjectId, ref: "Headquarters", required: true },
    cantidad: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("HeadquarterTransfer", headquarterTransferSchema);
