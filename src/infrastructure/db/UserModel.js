const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    tipoDocumento: { type: String, required: true, enum: ["CC", "TI"] },
    numeroDocumento: { type: String, required: true, unique: true },
    nombreCompleto: { type: String, required: true },
    correo: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    rolId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    sedeId: { type: mongoose.Schema.Types.ObjectId, ref: "Sede", required: true },
    // ✅ Función específica del empleado dentro de Producción (Diseño, Ficha
    // Técnica, Corte, Compras, Producción, Recepción). Separado del rol de
    // acceso (Empleado/Administrador/Gerente) — solo tiene sentido cuando
    // rolId apunta al rol "Empleado"; para Administrador/Gerente queda null.
    cargo: { type: String, default: null },
    estado: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);