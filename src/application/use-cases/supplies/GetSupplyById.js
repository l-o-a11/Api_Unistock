// application/use-cases/supplies/GetSupplyById.js

class GetSupplyById {
  constructor(supplyRepository) {
    this.supplyRepository = supplyRepository;
  }

  async execute(id) {
    const supply = await this.supplyRepository.findById(id);

    if (!supply) {
      const error = new Error("Insumo no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return supply.toPublic();
  }
}

module.exports = GetSupplyById;
