// infrastructure/db/ProductModel.js

const mongoose = require("mongoose");

const materialTechnicalSpecificationsSchema = new mongoose.Schema(
  {
    id_materiales: { type: mongoose.Schema.Types.ObjectId, ref: "MaterialTechnicalSpecifications", required: true },
    id_insumo: { type: mongoose.Schema.Types.ObjectId, ref: "//Aquí va el insumo", required: true },
    id_ficha_tecnica: { type: mongoose.Schema.Types.ObjectId, ref: "TechnicalSpecification", required: true },
    id_medida: { type: mongoose.Schema.Types.ObjectId, ref: "//Aquí va la medida", required: true },
    cantidades: { type: String, required: true },
  },
  { timestamps: true },
);

// No exponer el password en ninguna respuesta JSON
productSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Product", productSchema);