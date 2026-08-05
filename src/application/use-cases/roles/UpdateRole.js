// application/use-cases/roles/UpdateRole.js

const { validatePermissions } = require("../../../shared/utils/rolePermissionValidator");

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

    // Validate name uniqueness if changed
    if (nombre && nombre !== existing.nombre) {
      const nameConflict = await this.roleRepository.findByName(nombre);
      if (nameConflict) {
        const error = new Error("Ya existe un rol con ese nombre");
        error.statusCode = 409;
        throw error;
      }
    }

    const changes = {};
    if (nombre !== undefined) changes.nombre = nombre;
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
