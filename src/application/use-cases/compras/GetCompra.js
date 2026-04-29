// application/use-cases/compras/GetCompra.js

class GetCompra {
  constructor(compraRepository) {
    this.compraRepository = compraRepository;
  }

  execute(filters = {}) {
    const compras = this.compraRepository.findAll(filters);
    return compras.map(c => c.toPublic());
  }
}

module.exports = GetCompra;