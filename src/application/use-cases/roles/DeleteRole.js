// application/use-cases/roles/DeleteRole.js

class DeleteRole {
    constructor(roleRepository, userRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    async execute(id) {
        const role = this.roleRepository.findById(id);
        if (!role) {
            const error = new Error("Rol no encontrado");
            error.statusCode = 404;
            throw error;
        }

        // Verificar si hay usuarios activos asignados a este rol
        const usersWithRole = this.userRepository.findAll({ roleId: id, estado: true });
        if (usersWithRole.length > 0) {
            const error = new Error("No se puede eliminar el rol porque hay usuarios activos asignados");
            error.statusCode = 422;
            throw error;
        }

        // Soft delete
        return this.roleRepository.update(id, { estado: false });
    }
}

module.exports = DeleteRole;