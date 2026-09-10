// application/use-cases/production/GetProduction.js
// Caso de uso: listar Produccion con filtros opcionales

class GetProduction {
  constructor(productionRepository) {
    this.productionRepository = productionRepository;
  }

  async execute(filters = {}) {
    const result = await this.productionRepository.findAll(filters);
    const productions = Array.isArray(result?.data) ? result.data : [];
    return productions.map((p) => p.toJSON());
  }
}

module.exports = GetProduction;
