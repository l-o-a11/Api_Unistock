const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String },
    estado: { type: Boolean, default: true },
    permisos: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("Role", roleSchema);
