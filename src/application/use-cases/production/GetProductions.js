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
    // 🐛 FIX: ProductionRepository.findAll() devuelve un ARRAY plano,
    // no un objeto { data, total, ... }. Por eso result.data era
    // undefined y causaba TypeError al llamar .map().
    const orders = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : []);
    return {
      data: orders.map((p) => p.toJSON()),
      total: orders.length,
      page: 1,
      limit: orders.length || 10,
      totalPages: 1,
    };
  }
}

module.exports = GetProductions;
