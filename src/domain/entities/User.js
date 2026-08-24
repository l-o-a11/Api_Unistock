// domain/entities/User.js
// Entidad pura del dominio — sin dependencias externas.

// Nombre canónico del rol con acceso total al sistema.
// Debe coincidir exactamente con el campo `nombre` del RoleModel.
const ROL_ADMINISTRADOR = "Administrador";

class User {
  constructor({
    id,
    tipoDocumento,
    numeroDocumento,
    nombreCompleto,
    correo,
    password,
    rolId,
    rolNombre = null,   // poblado por el repositorio vía populate
    sedeId,
    // ✅ Función específica del empleado dentro de Producción — solo aplica
    // cuando rolNombre es "Empleado" (null para Administrador/Gerente).
    cargo = null,
    estado = true,
    intentosFallidos = 0,
  }) {
    this.id = id;
    this.tipoDocumento = tipoDocumento;
    this.numeroDocumento = numeroDocumento;
    this.nombreCompleto = nombreCompleto;
    this.correo = correo;
    this.password = password;   // siempre hasheada — nunca exponer al cliente
    this.rolId = rolId;
    this.rolNombre = rolNombre;
    this.sedeId = sedeId;
    this.cargo = cargo;
    this.estado = estado;
    this.intentosFallidos = intentosFallidos;
  }

  // Devuelve el objeto sin el password — para respuestas al cliente
  toPublic() {
    const { password, ...safe } = this;
    return safe;
  }

  /**
   * Regla de dominio: ¿este usuario es el último administrador activo?
   *
   * Antes comparaba this.rolId === 2 (número hardcodeado), lo cual nunca era
   * verdad porque rolId es un ObjectId string. Se corrigió para comparar por
   * nombre de rol, que es estable entre ambientes y no depende de ningún ID.
   *
   * @param {number} activeAdminCount - resultado de UserRepository.countActiveAdmins()
   */
  isLastActiveAdmin(activeAdminCount) {
    const esAdmin = this.rolNombre?.trim().toLowerCase() === ROL_ADMINISTRADOR.toLowerCase();
    return esAdmin && this.estado === true && activeAdminCount <= 1;
  }
}

module.exports = User;