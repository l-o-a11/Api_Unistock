// application/use-cases/users/UpdateUser.js

const normalizeCargos = (cargo) => [
  ...new Set(
    (Array.isArray(cargo) ? cargo : cargo ? [cargo] : [])
      .map((item) => String(item).trim())
      .filter(Boolean),
  ),
];

class UpdateUser {
  constructor(userRepository, roleRepository, siteRepository) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.siteRepository = siteRepository;
  }

  async execute(id, data) {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const {
      tipoDocumento,
      numeroDocumento,
      nombreCompleto,
      correo,
      rolId,
      sedeId,
      cargo,
      cargos,
    } = data;

    // Unicidad de correo (excluye el usuario actual)
    if (correo && correo !== existing.correo) {
      const byEmail = await this.userRepository.findByEmail(correo);
      if (byEmail && byEmail.id.toString() !== id.toString()) {
        const error = new Error(
          "Ya existe otro usuario con ese correo electrónico",
        );
        error.statusCode = 409;
        throw error;
      }
    }

    // Unicidad de documento (excluye el usuario actual)
    if (numeroDocumento && numeroDocumento !== existing.numeroDocumento) {
      const byDoc = await this.userRepository.findByDocument(numeroDocumento);
      if (byDoc && byDoc.id.toString() !== id.toString()) {
        const error = new Error(
          "Ya existe otro usuario con ese número de documento",
        );
        error.statusCode = 409;
        throw error;
      }
    }

    const changes = {};
    if (tipoDocumento) changes.tipoDocumento = tipoDocumento;
    if (numeroDocumento) changes.numeroDocumento = numeroDocumento;
    if (nombreCompleto) changes.nombreCompleto = nombreCompleto.trim();
    if (correo) changes.correo = correo;

    if (rolId) {
      const role = await this.roleRepository.findById(rolId);
      if (!role || !role.estado) {
        const error = new Error("Rol inválido o inactivo");
        error.statusCode = 422;
        throw error;
      }

      // FIX: misma regla que en CreateUser — máximo un Gerente activo.
      // Se excluye al propio usuario (id) del conteo: si ya era Gerente y
      // solo se está editando otro campo, no debe bloquearse a sí mismo.
      if (role.nombre?.trim().toLowerCase() === "gerente") {
        const otrosGerentesActivos =
          await this.userRepository.countActiveByRoleName("Gerente", id);
        if (otrosGerentesActivos >= 1) {
          const error = new Error(
            "Ya existe un Gerente activo. Solo puede haber un Gerente a la vez.",
          );
          error.statusCode = 409;
          throw error;
        }
      }

      changes.rolId = rolId;
    }

    if (sedeId) {
      const site = await this.siteRepository.findById(sedeId);
      if (!site || !site.estado) {
        const error = new Error("Sede inválida o inactiva");
        error.statusCode = 422;
        throw error;
      }
      changes.sedeId = sedeId;
    }

    // `cargo` solo se actualiza si el payload lo incluye explícitamente
    // con valores no vacíos. Si el frontend envía `cargos: []` (para roles
    // que no son "Empleado"), no tocamos el campo en BD para evitar
    // pisar datos existentes. Quien quiera limpiar los cargos debe enviar
    // explícitamente `cargo: []` (no `cargos`).
    const hasCargo = cargo !== undefined;
    const hasCargos = cargos !== undefined;
    if (hasCargo || hasCargos) {
      const normalized = normalizeCargos(cargo ?? cargos);
      // Solo persistir si se proporcionó un valor concreto (array vacío
      // incluso, pero no cuando ni cargo ni cargos vienen en el payload).
      changes.cargo = normalized;
    }

    // Si no hay nada que cambiar, devolver el usuario actual sin tocar BD
    if (Object.keys(changes).length === 0) {
      return existing.toPublic ? existing.toPublic() : existing;
    }

    const updated = await this.userRepository.update(id, changes);
    if (!updated) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }
    const { password, ...userPublic } = updated.toObject
      ? updated.toObject()
      : updated;
    return userPublic;
  }
}

module.exports = UpdateUser;
