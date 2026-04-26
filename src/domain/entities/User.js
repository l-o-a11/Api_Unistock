// domain/entities/User.js
// Entidad pura del dominio — sin dependencias externas.
// Define la forma canónica de un Usuario y las reglas que le pertenecen.

class User {
  constructor({
    id,
    tipoDocumento,
    numeroDocumento,
    nombreCompleto,
    correo,
    password,
    rolId,
    sedeId,
    estado = true,
  }) {
    this.id = id;
    this.tipoDocumento = tipoDocumento;
    this.numeroDocumento = numeroDocumento;
    this.nombreCompleto = nombreCompleto;
    this.correo = correo;
    this.password = password; // siempre hasheada
    this.rolId = rolId;
    this.sedeId = sedeId;
    this.estado = estado;
  }

  // Devuelve el objeto sin el password — para respuestas al cliente
  toPublic() {
    const { password, ...safe } = this;
    return safe;
  }

  // Regla de dominio: ¿puede este usuario ser desactivado/eliminado?
  isLastActiveAdmin(activeAdminCount) {
    return this.rolId === 2 && this.estado === true && activeAdminCount <= 1;
  }
}

module.exports = User;