// application/use-cases/production/CreateProduction.js
class CreateProduction {
  constructor(productionRepository) {
    this.productionRepository = productionRepository;
  }

  async execute(data) {
    const { fecha_entrega, cliente, id_produccion } = data;

    if (!fecha_entrega || !cliente || !id_produccion) {
      const error = new Error("Faltan campos requeridos");
      error.statusCode = 400;
      throw error;
    }

    return this.productionRepository.create({
      fecha_entrega,
      cliente,
      id_produccion,
    });
  }
}

module.exports = CreateProduction;
