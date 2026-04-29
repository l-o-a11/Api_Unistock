// application/use-cases/productions/DeleteUser.js

class DeleteProduction {
  constructor(productionRepository) {
    this.productionRepository = productionRepository;
  }

  execute(id) {
    const production = this.productionRepository.findById(id);
    if (!production) {
      const error = new Error("Produccion no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // Protección: no eliminar al único administrador activo
    if (production.isLastActiveAdmin(this.productionRepository.countActiveAdmins())) {
      const error = new Error(
        "No se puede eliminar el único administrador activo del sistema",
      );
      error.statusCode = 422;
      throw error;
    }

    this.productionRepository.delete(id);
    return true;
  }
}