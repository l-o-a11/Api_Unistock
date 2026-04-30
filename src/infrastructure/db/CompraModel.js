// infrastructure/db/CompraModel.js

const mongoose = require("mongoose");

const compraSchema = new mongoose.Schema(
  {
    fecha:       { type: Date, required: true },
    proveedorId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    total:       { type: Number, required: true },
    estado:      { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Compra", compraSchema);
