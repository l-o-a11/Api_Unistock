// application/use-cases/roles/DeleteRol.js

class DeleteRol {
    constructor(rolRepository, userRepository) {
        this.rolRepository = rolRepository;
        this.userRepository = userRepository;
    }

    async execute(id) {
        const rol = this.rolRepository.findById(id);
        if (!rol) {
            const error = new Error("Rol no encontrado");
            error.statusCode = 404;
            throw error;
        }

        // Verificar si hay usuarios activos asignados a este rol
        const usersWithRol = this.userRepository.findAll({ rolId: id, estado: true });
        if (usersWithRol.length > 0) {
            const error = new Error("No se puede eliminar el rol porque hay usuarios activos asignados");
            error.statusCode = 422;
            throw error;
        }

        // Soft delete
        return this.rolRepository.update(id, { estado: false });
    }
}

module.exports = DeleteRol;