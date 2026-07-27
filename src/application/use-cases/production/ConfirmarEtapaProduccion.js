/**
 * ConfirmarEtapaProduccion.js
 *
 * Caso de uso: El empleado asignado a la etapa actual confirma que terminó
 * su trabajo. Marca `etapaConfirmada: true` en la orden (NO cambia el estado
 * de la orden — eso lo hace el Gerente después con CambiarEstadoProduction).
 *
 * Solo el empleado cuyo `id` coincide con `empleadoAsignadoId` de la orden
 * puede ejecutar esta acción. Valida también que la orden esté en una etapa
 * asignable (Corte, Compras, Recepción, Producción).
 *
 * Al confirmar, se notifica vía correo a todos los usuarios con rol Gerente
 * para que sepan que la etapa ha sido completada.
 */

const Production = require("../../../domain/entities/Production");
const { sendProductionStageCompletedEmail } = require("../../../shared/utils/emailService");

const ETAPAS_ASIGNABLES = ["Corte", "Compras", "Recepción", "Producción"];

class ConfirmarEtapaProduccion {
  constructor(productionRepository, userRepository) {
    this.productionRepository = productionRepository;
    this.userRepository = userRepository;
  }

  async execute(id, solicitanteId) {
    // 1. Validar que el solicitanteId está presente
    if (!solicitanteId) {
      const error = new Error("No se pudo identificar al usuario solicitante");
      error.statusCode = 401;
      throw error;
    }

    // 2. Buscar la orden
    const production = await this.productionRepository.findById(id);
    if (!production) {
      const error = new Error("Orden de producción no encontrada");
      error.statusCode = 404;
      throw error;
    }

    // 3. Validar que no esté anulada
    if (production.estaAnulada()) {
      const error = new Error("No se puede confirmar la etapa de una orden anulada");
      error.statusCode = 422;
      throw error;
    }

    // 4. Validar que la orden esté en una etapa asignable
    if (!ETAPAS_ASIGNABLES.includes(production.estado)) {
      const error = new Error(
        `La etapa "${production.estado}" no requiere confirmación del empleado. ` +
        `Solo las etapas ${ETAPAS_ASIGNABLES.join(", ")} requieren confirmación.`,
      );
      error.statusCode = 422;
      throw error;
    }

    // 5. Validar que la orden tenga un empleado asignado
    if (!production.empleadoAsignadoId) {
      const error = new Error(
        "No hay un empleado asignado a esta etapa. El Gerente debe asignar a alguien primero.",
      );
      error.statusCode = 422;
      throw error;
    }

    // 6. Validar que el solicitante ES el empleado asignado
    if (String(production.empleadoAsignadoId) !== String(solicitanteId)) {
      const error = new Error(
        "Solo el empleado asignado a esta etapa puede confirmar su finalización.",
      );
      error.statusCode = 403;
      throw error;
    }

    // 7. Validar que no esté ya confirmada
    if (production.etapaConfirmada) {
      const error = new Error("La etapa ya fue confirmada anteriormente.");
      error.statusCode = 422;
      throw error;
    }

// 8. Marcar etapaConfirmada = true y agregar entrada al historial
    const historialEntry = {
      estado: production.estado,
      fecha: new Date(),
      id_usuario: solicitanteId,
      user: null, // el nombre se puede resolver después si es necesario
      motivo: "Empleado confirmó finalización de la etapa",
    };

    // Primero actualizar etapaConfirmada
    const updated = await this.productionRepository.update(id, {
      etapaConfirmada: true,
    });

    // Luego agregar entrada al historial (no se puede mezclar $push con update plano)
    if (updated) {
      await this.productionRepository.agregarHistorial(
        id,
        "Empleado confirmó finalización de la etapa",
        solicitanteId,
        null,
        production.estado,
      );
    }

    if (!updated) {
      const error = new Error("Error al confirmar la etapa");
      error.statusCode = 500;
      throw error;
    }

    // 📧 Notificar a todos los Gerentes que el empleado completó la etapa,
    // para que sepan que deben revisar y avanzar la orden. Fire-and-forget:
    // un fallo de correo no debe bloquear la confirmación.
    this._notificarGerentes(production, solicitanteId).catch((err) => {
      console.error("No se pudo notificar a los gerentes:", err.message);
    });

    return updated.toJSON();
  }

  /**
   * Notifica a todos los Gerentes del sistema que un empleado completó
   * su etapa en una orden de producción. Fire-and-forget.
   */
  async _notificarGerentes(production, empleadoId) {
    if (!this.userRepository) return;

    // Obtener el nombre del empleado que confirmó
    let empleadoNombre = "El empleado";
    try {
      const empleado = await this.userRepository.findById(empleadoId);
      if (empleado) {
        empleadoNombre = empleado.nombreCompleto || empleado.nombre || empleado.correo || "El empleado";
      }
    } catch (err) {
      console.warn("[ConfirmarEtapa] No se pudo obtener el nombre del empleado:", err.message);
    }

    // Buscar todos los usuarios con rol Gerente
    const RoleModel = require("../../../infrastructure/db/RoleModel");
    let rolGerente;
    try {
      rolGerente = await RoleModel.findOne({ nombre: "Gerente" }).lean();
    } catch (err) {
      console.warn("[ConfirmarEtapa] No se pudo encontrar el rol Gerente:", err.message);
      return;
    }
    if (!rolGerente) {
      console.warn("[ConfirmarEtapa] No existe el rol Gerente en el sistema");
      return;
    }

    let gerentes;
    try {
      gerentes = await this.userRepository.findAll({ rolId: rolGerente._id });
    } catch (err) {
      console.warn("[ConfirmarEtapa] No se pudo obtener la lista de gerentes:", err.message);
      return;
    }

    if (!Array.isArray(gerentes) || gerentes.length === 0) return;

    // Enviar correo a cada Gerente que tenga correo válido
    for (const gerente of gerentes) {
      if (!gerente.correo) continue;
      try {
        await sendProductionStageCompletedEmail({
          nombreCompleto: gerente.nombreCompleto || gerente.nombre || "Gerente",
          correo: gerente.correo,
          numeroOrden: production.numero_orden,
          etapaCompletada: production.estado,
          empleadoNombre,
        });
      } catch (err) {
        console.warn(`[ConfirmarEtapa] No se pudo notificar al gerente ${gerente.correo}:`, err.message);
      }
    }
  }
}

module.exports = ConfirmarEtapaProduccion;

