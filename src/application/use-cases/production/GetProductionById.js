// application/use-cases/production/GetProductionById.js

class GetProductionById {
  constructor(productionRepository) {
    this.productionRepository = productionRepository;
  }

  async execute(id) {
    const production = await this.productionRepository.findById(id);

    if (!production) {
      const error = new Error("Orden de producción no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return production.toJSON();
  }
}

module.exports = GetProductionById;
