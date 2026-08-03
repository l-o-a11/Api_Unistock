const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    tipoDocumento: { type: String, required: true, enum: ["CC", "TI", "CE", "PEP", "PAS", "PPT"] },
    numeroDocumento: { type: String, required: true, unique: true },
    nombreCompleto: { type: String, required: true },
    correo: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    rolId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    sedeId: { type: mongoose.Schema.Types.ObjectId, ref: "Sede", required: true },
    // ✅ Función específica del empleado dentro de Producción (Diseño, Ficha
    // Técnica, Corte, Compras, Producción, Recepción). Un empleado puede
    // atender varias etapas, por eso se guarda como arreglo. Separado del rol
    // de acceso (Empleado/Administrador/Gerente).
    cargo: { type: [String], default: [] },
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