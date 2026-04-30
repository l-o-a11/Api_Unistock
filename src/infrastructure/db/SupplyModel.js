// infrastructure/db/InsumoModel.js

const mongoose = require("mongoose");

const supplySchema = new mongoose.Schema(
  {
    nombre:       { type: String, required: true },
    categoria:    { type: String, required: true },
    stock:        { type: Number, default: 0 },
    valor_medida: { type: Number },
    medida:       { type: String },
    imagenes_Url: { type: [String] },
    estado:       { type: Boolean, default: true },
    propiedades:  { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true },
);


module.exports = mongoose.model("Supply", supplySchema);
