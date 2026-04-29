// application/use-cases/productions/GetUser.js
// Caso de uso: listar Produccion con filtros opcionales

class GetProduction {
  constructor(productionRepository) {
    this.productionRepository = productionRepository;
  }

  execute(filters = {}) {
    const productions = this.productionRepository.findAll(filters);
    return productions.map((u) => u.toPublic());
  }
}