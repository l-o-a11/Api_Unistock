/**
 * ConfirmarEtapaProduccion.js
 *
 * Marca la etapa actual de la orden como "confirmada" por el empleado
 * asignado. NO cambia el estado de la orden — solo establece
 * `etapaConfirmada: true` para que el Gerente sepa que el empleado
 * terminó su trabajo y proceda a asignar al siguiente empleado.
 *
 * Solo el empleado asignado a la etapa actual puede ejecutar esta
 * acción.
 */
class ConfirmarEtapaProduccion {
  constructor(productionRepository, userRepository) {
    this.productionRepository = productionRepository;
    this.userRepository = userRepository;
  }

  async execute(ordenId, empleadoId) {
    const orden = await this.productionRepository.findById(ordenId);
    if (!orden) {
      const err = new Error("Orden de producción no encontrada");
      err.statusCode = 404;
      throw err;
    }
    if (orden.estaAnulada()) {
      const err = new Error("No se puede confirmar una orden anulada");
      err.statusCode = 422;
      throw err;
    }
    if (!orden.empleadoAsignadoId) {
      const err = new Error("No hay empleado asignado a esta etapa");
      err.statusCode = 422;
      throw err;
    }
    if (orden.etapaConfirmada) {
      const err = new Error("Esta etapa ya fue confirmada anteriormente");
      err.statusCode = 422;
      throw err;
    }

    // Solo el empleado asignado puede confirmar
    if (String(orden.empleadoAsignadoId) !== String(empleadoId)) {
      const err = new Error("Solo el empleado asignado a esta etapa puede confirmarla");
      err.statusCode = 403;
      throw err;
    }

    // Actualizar: solo marca etapaConfirmada, no cambia el estado
    const actualizado = await this.productionRepository.update(ordenId, {
      etapaConfirmada: true,
    });

    return actualizado.toJSON();
  }
}

module.exports = ConfirmarEtapaProduccion;

