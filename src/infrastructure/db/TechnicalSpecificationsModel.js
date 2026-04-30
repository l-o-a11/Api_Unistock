// infrastructure/db/ProductModel.js

const mongoose = require("mongoose");
const { version } = require("react");

const technicalSpecificationSchema = new mongoose.Schema(
  {
    id_ficha_tecnica: { type: mongoose.Schema.Types.ObjectId, ref: "TechnicalSpecification", required: true },
    id_producto: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    responsable: { type: String, required: true },
    fecha_inicio: { type: String, required: true },
    fecha_fin: { type: String, required: true },
    versiones: { type: Number, required: true },
    descripciones: { type: Boolean, required: true },
  },
  { timestamps: true },
);

// No exponer el password en ninguna respuesta JSON
technicalSpecificationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Product", productSchema);