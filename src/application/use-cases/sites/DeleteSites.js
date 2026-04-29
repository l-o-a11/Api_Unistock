// application/use-cases/sites/DeleteSite.js

class DeleteSite {
    constructor(siteRepository, userRepository) {
        this.siteRepository = siteRepository;
        this.userRepository = userRepository;
    }

    async execute(id) {
        const site = this.siteRepository.findById(id);
        if (!site) {
            const error = new Error("Sede no encontrada");
            error.statusCode = 404;
            throw error;
        }

        // Verificar si hay usuarios activos en esta sede
        const usersInSite = this.userRepository.findAll({ siteId: id, estado: true });
        if (usersInSite.length > 0) {
            const error = new Error("No se puede eliminar la sede porque tiene usuarios activos asignados");
            error.statusCode = 422;
            throw error;
        }

        // Soft delete
        return this.siteRepository.update(id, { estado: false });
    }
}

module.exports = DeleteSite;