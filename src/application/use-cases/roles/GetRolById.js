// application/use-cases/roles/GetRolById.js

class GetRolById {
    constructor(rolRepository) {
        this.rolRepository = rolRepository;
    }

    execute(id) {
        const rol = this.rolRepository.findById(id);
        if (!rol) {
            const error = new Error("Rol no encontrado");
            error.statusCode = 404;
            throw error;
        }
        return rol;
    }
}

module.exports = GetRolById;