// infrastructure/db/ProductModel.js

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id_categorias: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory", required: true },
    // ✅ Sede a la que pertenece el producto. Nullable a propósito — los
    // productos creados antes de este cambio no tienen sede y deben seguir
    // siendo visibles para todos (mismo criterio que ProductionOrderModel).
    sedeId: { type: mongoose.Schema.Types.ObjectId, ref: "Sede", default: null },
    imagenes_Url: { type: [String], default: [] },
    referencia: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, required: true },
    estado: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Product", productSchema);