// application/use-cases/supplies/DeleteSupply.js

class DeleteSupply {
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

    await this.supplyRepository.delete(id);

    return { message: "Insumo eliminado correctamente" };
  }
}

module.exports = DeleteSupply;
