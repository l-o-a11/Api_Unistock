// application/use-cases/production/CreateProduction.js
class CreateProduction {
  constructor(productionRepository) {
    this.productionRepository = productionRepository;
  }

  async execute(data) {
    const { fecha_entrega, cliente, id_usuario } = data;

    if (!fecha_entrega || !cliente || !id_usuario) {
      const error = new Error("Faltan campos requeridos");
      error.statusCode = 400;
      throw error;
    }

    return this.productionRepository.create({
      fecha_entrega,
      cliente,
      id_usuario,
    });
  }
}

module.exports = CreateProduction;
