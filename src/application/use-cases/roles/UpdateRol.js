// application/use-cases/roles/UpdateRol.js

const { validatePermissions } = require("../../../shared/utils/rolePermissionValidator");

class UpdateRol {
    constructor(rolRepository, moduloRepository, privilegioRepository) {
        this.rolRepository = rolRepository;
        this.moduloRepository = moduloRepository;
        this.privilegioRepository = privilegioRepository;
    }

    async execute(id, data) {
        const existing = this.rolRepository.findById(id);
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

        // Validar unicidad de nombre si cambió
        if (nombre && nombre !== existing.nombre && this.rolRepository.findByName(nombre)) {
            const error = new Error("Ya existe un rol con ese nombre");
            error.statusCode = 409;
            throw error;
        }

        const changes = {};
        if (nombre !== undefined) changes.nombre = nombre;
        if (descripcion !== undefined) changes.descripcion = descripcion;
        if (permisos !== undefined) changes.permisos = validatePermissions(permisos, this.moduloRepository, this.privilegioRepository);
        if (estado !== undefined) changes.estado = estado;

        return this.rolRepository.update(id, changes);
    }
}

module.exports = UpdateRol;