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

    // VALIDACION: No eliminar si tiene fichas técnicas asociadas
    const supplys = await this.supplyRepository.findByCategoryId(id);

    if (supplys && supplys.length > 0) {
      const error = new Error(
        "No se puede eliminar el insumo porque tiene más de una ficha técnica asociada",
      );
      error.statusCode = 422;
      throw error;
    }

    await this.supplyRepository.delete(id);

    return { message: "Insumo eliminado correctamente" };
  }
}

module.exports = DeleteSupply;