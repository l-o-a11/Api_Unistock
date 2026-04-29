const mongoose = require("mongoose");

const insumoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    categoria: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    valor_medida: { type: Number, required: true },
    medida: { type: String, required: true },
    estado: { type: Boolean, default: true },
    propiedades: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("Insumo", insumoSchema);
