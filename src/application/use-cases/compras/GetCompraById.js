// application/use-cases/compras/GetCompraById.js

class GetCompraById {
  constructor(compraRepository) {
    this.compraRepository = compraRepository;
  }

  execute(id) {
    const compra = this.compraRepository.findById(id);
    if (!compra) {
      const error = new Error("Compra no encontrada");
      error.statusCode = 404;
      throw error;
    }
    return compra.toPublic();
  }
}

module.exports = GetCompraById;