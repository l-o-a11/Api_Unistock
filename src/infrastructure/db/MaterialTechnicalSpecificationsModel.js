// infrastructure/db/MaterialTechnicalSpecificationsModel.js

const mongoose = require("mongoose");

const materialTechnicalSpecificationsSchema = new mongoose.Schema(
  {
    id_materiales: { type: mongoose.Schema.Types.ObjectId, ref: "MaterialTechnicalSpecifications", required: true },
    id_insumo: { type: mongoose.Schema.Types.ObjectId, ref: "Insumo", required: true },
    id_ficha_tecnica: { type: mongoose.Schema.Types.ObjectId, ref: "TechnicalSpecification", required: true },
    id_medida: { type: mongoose.Schema.Types.ObjectId, ref: "Medida", required: true },
    cantidades: { type: String, required: true },
  },
  { timestamps: true },
);

// No exponer el password en ninguna respuesta JSON
materialTechnicalSpecificationsSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("MaterialTechnicalSpecifications", materialTechnicalSpecificationsSchema);