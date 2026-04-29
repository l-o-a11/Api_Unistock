// application/use-cases/sedes/DeleteSede.js

class DeleteSede {
    constructor(sedeRepository, userRepository) {
        this.sedeRepository = sedeRepository;
        this.userRepository = userRepository;
    }

    async execute(id) {
        const sede = this.sedeRepository.findById(id);
        if (!sede) {
            const error = new Error("Sede no encontrada");
            error.statusCode = 404;
            throw error;
        }

        // Verificar si hay usuarios activos en esta sede
        const usersInSede = this.userRepository.findAll({ sedeId: id, estado: true });
        if (usersInSede.length > 0) {
            const error = new Error("No se puede eliminar la sede porque tiene usuarios activos asignados");
            error.statusCode = 422;
            throw error;
        }

        // Soft delete
        return this.sedeRepository.update(id, { estado: false });
    }
}

module.exports = DeleteSede;