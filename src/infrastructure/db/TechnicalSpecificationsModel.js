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
    client: { type: String, default: "" },
    ref: { type: String, default: "" },
    type: { type: String, default: "" },
    description: { type: String, default: "" },
    observations: { type: String, default: "" },
    createdBy: { type: String, default: "" },
    image: { type: mongoose.Schema.Types.Mixed, default: null },
    fabrics: { type: [mongoose.Schema.Types.Mixed], default: [] },
    cups: { type: [mongoose.Schema.Types.Mixed], default: [] },
    closures: { type: [mongoose.Schema.Types.Mixed], default: [] },
    accessories: { type: [mongoose.Schema.Types.Mixed], default: [] },
    measurements: { type: [mongoose.Schema.Types.Mixed], default: [] },
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