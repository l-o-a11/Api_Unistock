// application/use-cases/sites/DeleteSites.js

class DeleteSite {
    constructor(siteRepository, userRepository) {
        this.siteRepository = siteRepository;
        this.userRepository = userRepository;
    }

    async execute(id) {
        const site = await this.siteRepository.findById(id);
        if (!site) {
            const error = new Error("Sede no encontrada");
            error.statusCode = 404;
            throw error;
        }

        const usersInSite = await this.userRepository.findAll({ sedeId: id, estado: true });
        if (usersInSite && usersInSite.length > 0) {
            const error = new Error("No se puede eliminar la sede porque tiene usuarios activos asignados");
            error.statusCode = 422;
            throw error;
        }

        await this.siteRepository.delete(id);
        return { deleted: true, id };
    }
}

module.exports = DeleteSite;