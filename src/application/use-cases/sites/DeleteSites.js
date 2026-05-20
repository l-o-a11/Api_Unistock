// application/use-cases/sites/DeleteSite.js

class DeleteSite {
    constructor(siteRepository, userRepository, ProductionOrderModel) {
        this.siteRepository = siteRepository;
        this.userRepository = userRepository;
        this.ProductionOrderModel = ProductionOrderModel;
    }

    async execute(id) {
        const site = await this.siteRepository.findById(id);
        if (!site) {
            const error = new Error("Sede no encontrada");
            error.statusCode = 404;
            throw error;
        }

        // Verificar si hay usuarios activos en esta sede
        const usersInSite = await this.userRepository.findAll({ sedeId: id, estado: true });
        if (usersInSite && usersInSite.length > 0) {
            const error = new Error("No se puede eliminar la sede porque tiene usuarios activos asignados");
            error.statusCode = 422;
            throw error;
        }

        // Verificar si existen órdenes de producción relacionadas a sedes
        const usersOfSite = await this.userRepository.findAll({ sedeId: id });
        const userIds = (usersOfSite || []).map(u => u.id).filter(Boolean);
        if (userIds.length > 0) {
            const relatedCount = await ProductionOrderModel.countDocuments({ id_usuario: { $in: userIds } }).catch(() => 0);
            if (relatedCount > 0) {
                const error = new Error("No se puede eliminar la sede porque existen órdenes de producción relacionadas");
                error.statusCode = 422;
                throw error;
            }
        }

         await this.siteRepository.delete(id);
    return { deleted: true, id };
    }
}

module.exports = DeleteSite;