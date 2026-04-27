// infrastructure/db/ProductionStateModel.js
const mongoose = require("mongoose");

const productionStateSchema = new mongoose.Schema(
  {
    nombre_estado: { type: String, required: true, unique: true },
    orden: { type: Number, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ProductionState", productionStateSchema);
