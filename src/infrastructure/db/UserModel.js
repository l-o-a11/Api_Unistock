// infrastructure/db/UserModel.js
// Modelo Mongoose para cuando conectes MongoDB de verdad.
// Por ahora la API usa el store en memoria de database.js,
// pero este modelo ya está listo para la migración.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    tipoDocumento: { type: String, required: true, enum: ["CC", "TI"] },
    numeroDocumento: { type: String, required: true, unique: true },
    nombreCompleto: { type: String, required: true },
    correo: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    rolId: { type: Number, required: true },
    sedeId: { type: Number, required: true },
    estado: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// No exponer el password en ninguna respuesta JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);