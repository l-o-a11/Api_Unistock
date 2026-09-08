// application/use-cases/roles/UpdateRole.js

const { validatePermissions } = require("../../../shared/utils/rolePermissionValidator");

const ROLE_NAME_PATTERN = /^\p{L}+(?: +\p{L}+)*$/u;

class UpdateRole {
  constructor(roleRepository, moduleRepository, privilegeRepository) {
    this.roleRepository = roleRepository;
    this.moduleRepository = moduleRepository;
    this.privilegeRepository = privilegeRepository;
  }

  async execute(id, data) {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      const error = new Error("Rol no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const {
      nombre,
      descripcion,
      permisos,
      estado,
    } = data;

    let nombreNormalizado;
    if (nombre !== undefined) {
      nombreNormalizado = typeof nombre === "string" ? nombre.trim() : "";
      if (!nombreNormalizado) {
        const error = new Error("Nombre es requerido");
        error.statusCode = 422;
        throw error;
      }
      if (!ROLE_NAME_PATTERN.test(nombreNormalizado)) {
        const error = new Error("El nombre solo puede contener letras y espacios");
        error.statusCode = 422;
        throw error;
      }
    }

    // Validate name uniqueness if changed
    if (nombreNormalizado !== undefined && nombreNormalizado !== existing.nombre) {
      const nameConflict = await this.roleRepository.findByName(nombreNormalizado);
      if (nameConflict) {
        const error = new Error("Ya existe un rol con ese nombre");
        error.statusCode = 409;
        throw error;
      }
    }

    const changes = {};
    if (nombreNormalizado !== undefined) changes.nombre = nombreNormalizado;
    if (descripcion !== undefined) changes.descripcion = descripcion;
    if (permisos !== undefined) {
      changes.permisos = await validatePermissions(
        permisos,
        this.moduleRepository,
        this.privilegeRepository,
      );
    }
    if (estado !== undefined) changes.estado = estado;

    return this.roleRepository.update(id, changes);
  }
}

module.exports = UpdateRole;
