// application/use-cases/production/AnularProduction.js
const Production = require("../../../domain/entities/Production");

class AnularProduction {
  constructor(productionRepository) {
    this.productionRepository = productionRepository;
  }

  async execute(id, motivo, id_usuario, user) {
    const production = await this.productionRepository.findById(id);

    if (!production) {
      const error = new Error("Orden de producción no encontrada");
      error.statusCode = 404;
      throw error;
    }

    if (production.estaAnulada()) {
      const error = new Error("La orden ya se encuentra anulada");
      error.statusCode = 422;
      throw error;
    }

    if (!motivo || !motivo.trim()) {
      const error = new Error("El motivo de anulación es requerido");
      error.statusCode = 400;
      throw error;
    }

    const updated = await this.productionRepository.anular(id, motivo.trim(), id_usuario, user);
    return updated.toJSON();
  }
}

module.exports = AnularProduction;
