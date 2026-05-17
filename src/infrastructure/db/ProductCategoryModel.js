// infrastructure/db/ProductCategoryModel.js

const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true },
    descripción: { type: String, required: true },
    cantidad_productos: { type: Number, default: 0 },
    productos_disponibles: { type: Number, default: 0 },
    estado: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productCategorySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("ProductCategory", productCategorySchema);