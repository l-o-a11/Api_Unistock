// application/use-cases/compras/DeleteCompra.js

class DeleteCompra {
  constructor(compraRepository) {
    this.compraRepository = compraRepository;
  }

  execute(id) {
    const deleted = this.compraRepository.delete(id);
    if (!deleted) {
      const error = new Error("Compra no encontrada");
      error.statusCode = 404;
      throw error;
    }
  }
}

module.exports = DeleteCompra;