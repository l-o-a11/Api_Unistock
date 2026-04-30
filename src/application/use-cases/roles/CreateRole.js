// application/use-cases/roles/CreateRole.js

const { validatePermissions } = require("../../../shared/utils/rolePermissionValidator");

class CreateRole {
    constructor(roleRepository, moduloRepository, privilegioRepository) {
        this.roleRepository = roleRepository;
        this.moduloRepository = moduloRepository;
        this.privilegioRepository = privilegioRepository;
    }

    async execute(data) {
        const {
            nombre,
            descripcion,
            permisos = [],
            estado = true,
        } = data;

        // Validaciones básicas
        if (!nombre || !descripcion) {
            const error = new Error("Nombre y descripción son requeridos");
            error.statusCode = 422;
            throw error;
        }

        // Unicidad de nombre
        if (this.roleRepository.findByName(nombre)) {
            const error = new Error("Ya existe un rol con ese nombre");
            error.statusCode = 409;
            throw error;
        }

        const permisosValidados = validatePermissions(permisos, this.moduloRepository, this.privilegioRepository);

        return this.roleRepository.create({
            nombre,
            descripcion,
            permisos: permisosValidados,
            estado,
        });
    }
}

module.exports = CreateRole;