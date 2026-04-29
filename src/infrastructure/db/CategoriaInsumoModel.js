const mongoose = require("mongoose");

const categoriaInsumoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String },
    estado: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("CategoriaInsumo", categoriaInsumoSchema);
