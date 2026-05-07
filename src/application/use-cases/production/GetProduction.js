// application/use-cases/productions/GetUser.js
// Caso de uso: listar Produccion con filtros opcionales

class GetProduction {
  constructor(productionRepository) {
    this.productionRepository = productionRepository;
  }

  async execute(filters = {}) {
  const productions = await this.productionRepository.findAll(filters);
  return productions.map((u) => u.toJSON()); // también cambia toPublic → toJSON
}
}