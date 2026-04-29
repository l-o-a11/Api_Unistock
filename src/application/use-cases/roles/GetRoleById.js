// application/use-cases/roles/GetRoleById.js

class GetRoleById {
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }

    execute(id) {
        const role = this.roleRepository.findById(id);
        if (!role) {
            const error = new Error("Rol no encontrado");
            error.statusCode = 404;
            throw error;
        }
        return role;
    }
}

module.exports = GetRoleById;