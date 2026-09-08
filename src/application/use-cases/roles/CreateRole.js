// application/use-cases/roles/CreateRole.js

const { validatePermissions } = require("../../../shared/utils/rolePermissionValidator");

const ROLE_NAME_PATTERN = /^\p{L}+(?: +\p{L}+)*$/u;

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
    const nombreNormalizado = typeof nombre === "string" ? nombre.trim() : "";
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

    // Name uniqueness
    const existing = await this.roleRepository.findByName(nombreNormalizado);
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

    const roleData = {
      nombre: nombreNormalizado,
      permisos: permisosValidados,
      estado,
    };
    if (descripcion !== undefined) roleData.descripcion = descripcion;

    return this.roleRepository.create(roleData);
  }
}

module.exports = CreateRole;
