// application/use-cases/compras/GetCompraDetail.js

class GetCompraDetail {
  constructor(compraDetailRepository) {
    this.compraDetailRepository = compraDetailRepository;
  }

  execute(filters = {}) {
    const details = this.compraDetailRepository.findAll(filters);
    return details.map(d => d.toPublic());
  }
}

module.exports = GetCompraDetail;