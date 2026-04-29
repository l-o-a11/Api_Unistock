const mongoose = require("mongoose");

const sedeSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    ciudad: { type: String, required: true },
    barrio: { type: String },
    direccion: { type: String, required: true },
    telefono: { type: Number, required: true },
    estado: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Sede", sedeSchema);
