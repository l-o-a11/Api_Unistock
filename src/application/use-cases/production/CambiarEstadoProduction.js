// application/use-cases/production/CambiarEstadoProduction.js
const Production = require("../../../domain/entities/Production");
const { sendProductionStageCompletedEmail } = require("../../../shared/utils/emailService");

class CambiarEstadoProduction {
  constructor(productionRepository, userRepository) {
    this.productionRepository = productionRepository;
    this.userRepository = userRepository;
  }

  /**
   * @param {Object} [options.solicitante] - Quien está pidiendo el cambio:
   *   { id, rolNombre }. Viene de req.user (requireAuth). Si no se pasa
   *   (compatibilidad con llamadas internas/legado), no se restringe por
   *   empleado asignado — evita romper flujos existentes.
   */
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

    // 🔒 Solo el empleado asignado a la etapa actual (o Gerente/Administrador)
    // puede avanzarla. Si la orden todavía no tiene empleado asignado (ej.
    // órdenes creadas antes de este cambio, o el admin no lo asignó), no se
    // restringe — así no se rompen flujos existentes.
    const solicitante = options.solicitante || null;
    if (production.empleadoAsignadoId && solicitante) {
      const rolSolicitante = (solicitante.rolNombre || "").trim().toLowerCase();
      // Solo Gerente tiene bypass total ("se encarga de todo en producción").
      // Administrador pasó a ser 100% observador — ya no puede avanzar
      // etapas, solo el empleado asignado (vía su botón "Confirmar").
      const esPrivilegiado = rolSolicitante === "gerente";
      const esElAsignado = String(production.empleadoAsignadoId) === String(solicitante.id);
      if (!esPrivilegiado && !esElAsignado) {
        const err = new Error(
          "Solo el empleado asignado a esta etapa (o un administrador) puede avanzarla",
        );
        err.statusCode = 403;
        throw err;
      }
    }

    // El empleado que tenía asignada la etapa que se está completando —
    // se usa después para el correo de check-in, antes de limpiarlo.
    const empleadoQueTermina = production.empleadoAsignadoId;
    const etapaCompletada = production.estado;

const updated = await this.productionRepository.cambiarEstado(
      id,
      nuevoEstado,
      id_usuario,
      user,
      // 🔁 Se limpia la asignación y la confirmación al avanzar:
      // la nueva etapa necesita que el admin asigne a alguien de nuevo
      // y el empleado de la nueva etapa debe confirmar desde cero.
      { ...(options.extra || {}), empleadoAsignadoId: null, etapaConfirmada: false },
    );

    // 📧 Avisar al admin de la sede DEL EMPLEADO que acaba de terminar su
    // parte (no de "la sede de la producción" — la orden no tiene sede
    // asignada hasta Recepción). Fire-and-forget: un fallo de correo no debe
    // bloquear el avance de la orden.
    if (empleadoQueTermina && this.userRepository) {
      this._notificarCheckIn(empleadoQueTermina, updated, etapaCompletada).catch((err) => {
        console.error("No se pudo enviar el correo de check-in:", err.message);
      });
    }

    return updated.toJSON();
  }

  async _notificarCheckIn(empleadoId, production, etapaCompletada) {
    const empleado = await this.userRepository.findById(empleadoId);
    if (!empleado || !empleado.sedeId) return;

    const usuariosDeLaSede = await this.userRepository.findAll({ sedeId: empleado.sedeId });
    const adminSede = usuariosDeLaSede.find(
      (u) => (u.rolNombre || "").trim().toLowerCase() === "administrador",
    );
    if (!adminSede || !adminSede.correo) return;

    await sendProductionStageCompletedEmail({
      nombreCompleto: adminSede.nombreCompleto,
      correo: adminSede.correo,
      numeroOrden: production.numero_orden,
      etapaCompletada,
      empleadoNombre: empleado.nombreCompleto,
    });
  }
}

module.exports = CambiarEstadoProduction;