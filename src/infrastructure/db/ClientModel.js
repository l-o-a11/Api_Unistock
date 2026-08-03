const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    documento: { type: String, required: true, unique: true, trim: true },
    telefono: { type: String, default: "", trim: true },
    correo: { type: String, default: "", trim: true },
  },
  { timestamps: true, collection: "cliente" }
);

clientSchema.index({ nombre: 1, documento: 1 });

module.exports = mongoose.model("Client", clientSchema);
