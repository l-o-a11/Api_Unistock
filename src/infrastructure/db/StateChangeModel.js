// infrastructure/db/StateChangeModel.js
const mongoose = require("mongoose");

const stateChangeSchema = new mongoose.Schema(
  {
    id_orden: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionOrder", required: true },
    id_estado: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionState", required: true },
    fecha: { type: Date, default: Date.now },
    id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("StateChange", stateChangeSchema);
