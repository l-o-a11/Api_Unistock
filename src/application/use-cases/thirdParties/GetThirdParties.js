// application/use-cases/thirdPartiess/GetUser.js
// Caso de uso: listar terceros con filtros opcionales

class GetUser {
  constructor(thirdPartiesRepository) {
    this.thirdPartiesRepository = thirdPartiesRepository;
  }

  execute(filters = {}) {
    const thirdPartiess = this.thirdPartiesRepository.findAll(filters);
    return thirdPartiess.map((u) => u.toPublic());
  }
}