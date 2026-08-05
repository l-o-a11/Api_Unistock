// application/use-cases/roles/CreateRole.js

const { validatePermissions } = require("../../../shared/utils/rolePermissionValidator");

class CreateRole {
  constructor(roleRepository, moduleRepository, privilegeRepository) {
    this.roleRepository = roleRepository;
    this.moduleRepository = moduleRepository;
    this.privilegeRepository = privilegeRepository;
  }

  async execute(data) {
    const {
      nombre,
      descripcion,
      permisos = [],
      estado = true,
    } = data;

    // Basic validations
    if (!nombre || !descripcion) {
      const error = new Error("Nombre y descripción son requeridos");
      error.statusCode = 422;
      throw error;
    }

    // Name uniqueness
    const existing = await this.roleRepository.findByName(nombre);
    if (existing) {
      const error = new Error("Ya existe un rol con ese nombre");
      error.statusCode = 409;
      throw error;
    }

    const permisosValidados = await validatePermissions(
      permisos,
      this.moduleRepository,
      this.privilegeRepository,
    );

    return this.roleRepository.create({
      nombre,
      descripcion,
      permisos: permisosValidados,
      estado,
    });
  }
}

module.exports = CreateRole;
