// application/use-cases/production/CambiarEstadoProduction.js
const Production = require("../../../domain/entities/Production");

class CambiarEstadoProduction {
  constructor(productionRepository) {
    this.productionRepository = productionRepository;
  }

  async execute(id, nuevoEstado, id_usuario, user, options = {}) {
    if (!Production.ESTADOS_VALIDOS.includes(nuevoEstado)) {
      const error = new Error(
        `Estado inválido. Los estados permitidos son: ${Production.ESTADOS_VALIDOS.join(", ")}`,
      );
      error.statusCode = 400;
      throw error;
    }

    // No se puede cambiar a Anulada por esta vía — debe usarse AnularProduction
    if (nuevoEstado === "Anulada") {
      const error = new Error(
        'Para anular una orden usa el endpoint PATCH /ordenes/:id/anular',
      );
      error.statusCode = 422;
      throw error;
    }

    const production = await this.productionRepository.findById(id);

    if (!production) {
      const error = new Error("Orden de producción no encontrada");
      error.statusCode = 404;
      throw error;
    }

    if (production.estaAnulada()) {
      const error = new Error("No se puede cambiar el estado de una orden anulada");
      error.statusCode = 422;
      throw error;
    }
    // Si se envía la opción { force: true } permitimos override (retroceder)
    const force = options.force === true;
    if (!force) {
      const currentIdx = Production.ESTADOS_VALIDOS.indexOf(production.estado);
      const nextIdx = Production.ESTADOS_VALIDOS.indexOf(nuevoEstado);
      if (!(nextIdx > currentIdx)) {
        const err = new Error('No se puede retroceder el estado sin autorización');
        err.statusCode = 422;
        throw err;
      }
    }

    const updated = await this.productionRepository.cambiarEstado(id, nuevoEstado, id_usuario, user, options.extra || {});
    return updated.toJSON();
  }
}

module.exports = CambiarEstadoProduction;
