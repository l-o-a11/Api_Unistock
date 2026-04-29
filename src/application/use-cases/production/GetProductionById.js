// application/use-cases/productions/GetUserById.js

class GetProductionById {
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

    return production.toPublic();
  }
}