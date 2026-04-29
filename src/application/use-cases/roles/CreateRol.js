// application/use-cases/roles/CreateRol.js

const { validatePermissions } = require("../../../shared/utils/rolePermissionValidator");

class CreateRol {
    constructor(rolRepository, moduloRepository, privilegioRepository) {
        this.rolRepository = rolRepository;
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
        if (this.rolRepository.findByName(nombre)) {
            const error = new Error("Ya existe un rol con ese nombre");
            error.statusCode = 409;
            throw error;
        }

        const permisosValidados = validatePermissions(permisos, this.moduloRepository, this.privilegioRepository);

        return this.rolRepository.create({
            nombre,
            descripcion,
            permisos: permisosValidados,
            estado,
        });
    }
}

module.exports = CreateRol;