const mongoose = require("mongoose");
const thirdPartiesSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  contacto: { type: String, required: true },
  barrio: { type: String },
  direccion: { type: String, required: true },
  telefono: { type: String, required: true },
  estado: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model("ThirdParties", thirdPartiesSchema);
