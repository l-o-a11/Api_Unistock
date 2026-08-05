// infrastructure/db/ThirdPartyAssignmentModel.js
const mongoose = require("mongoose");

const thirdPartyAssignmentSchema = new mongoose.Schema(
  {
    id_orden: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionOrder", required: true },
    id_tercero: { type: mongoose.Schema.Types.ObjectId, ref: "ThirdParties", required: true },
    cantidad: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ThirdPartyAssignment", thirdPartyAssignmentSchema);
