// infrastructure/db/TechnicalSpecificationsModel.js

const mongoose = require("mongoose");

const technicalSpecificationSchema = new mongoose.Schema(
  {
    id_producto: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    responsable: { type: String, required: true },
    fecha_inicio: { type: String, required: true },
    fecha_fin: { type: String, required: true },
    versiones: { type: Number, required: true, default: 1 },
    descripciones: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

technicalSpecificationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("TechnicalSpecification", technicalSpecificationSchema);