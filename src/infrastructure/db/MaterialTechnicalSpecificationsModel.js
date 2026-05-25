// infrastructure/db/MaterialTechnicalSpecificationsModel.js

const mongoose = require("mongoose");

const materialTechnicalSpecificationsSchema = new mongoose.Schema(
  {
    id_producto: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    id_ficha_tecnica: { type: mongoose.Schema.Types.ObjectId, ref: "TechnicalSpecification", required: true, index: true },
    id_insumo: { type: mongoose.Schema.Types.ObjectId, ref: "Supply" },
    id_medida: { type: mongoose.Schema.Types.ObjectId, ref: "Measure" },
    nombre: { type: String, trim: true, default: "" },
    unidad: { type: String, trim: true, default: "" },
    cantidades: { type: String, required: true },
    observaciones: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

materialTechnicalSpecificationsSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("MaterialTechnicalSpecifications", materialTechnicalSpecificationsSchema);