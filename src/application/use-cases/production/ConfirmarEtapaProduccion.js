// application/use-cases/production/ConfirmarEtapaProduccion.js
const Production = require("../../../domain/entities/Production");
const CambiarEstadoProduction = require("./CambiarEstadoProduction");

class ConfirmarEtapaProduccion {
  constructor(productionRepository, userRepository) {
    this.productionRepository = productionRepository;
    this.userRepository = userRepository;
  }

  async execute(id, solicitante) {
    const production = await this.productionRepository.findById(id);

    if (!production) {
      const error = new Error("Orden de producción no encontrada");
      error.statusCode = 404;
      throw error;
    }

    const estados = Production.ESTADOS_VALIDOS;
    const indiceActual = estados.indexOf(production.estado);

    if (indiceActual === -1) {
      const error = new Error(`Estado inválido: ${production.estado}`);
      error.statusCode = 400;
      throw error;
    }

    const siguienteEstado = estados[indiceActual + 1];
    if (!siguienteEstado) {
      const error = new Error("La orden ya está en la última etapa del flujo");
      error.statusCode = 422;
      throw error;
    }

    const useCase = new CambiarEstadoProduction(this.productionRepository, this.userRepository);
    return useCase.execute(
      id,
      siguienteEstado,
      solicitante?.id || null,
      solicitante,
      { solicitante },
    );
  }
}

module.exports = ConfirmarEtapaProduccion;
