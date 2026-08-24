// application/use-cases/production/GetProductions.js

class GetProductions {
  constructor(productionRepository) {
    this.productionRepository = productionRepository;
  }

  /**
   * @param {Object} filters — search, estado, id_usuario, fecha_desde, fecha_hasta,
   *                           page, limit, sortBy, order
   */
async execute(filters = {}) {
    const result = await this.productionRepository.findAll(filters);
    const orders = Array.isArray(result?.data) ? result.data : [];
    return {
      data: orders.map((p) => p.toJSON()),
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || orders.length,
      totalPages: result.totalPages || 0,
    };
  }
}

module.exports = GetProductions;
