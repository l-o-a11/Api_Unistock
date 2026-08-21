const { sendProductionAssignedEmail } = require("../../../shared/utils/emailService");

class ReasignarEmpleadoProduccion {
    constructor(productionRepository, userRepository) {
        this.productionRepository = productionRepository;
        this.userRepository = userRepository;
    }

    async execute(ordenId, nuevoEmpleadoId, motivo) {
        const orden = await this.productionRepository.findById(ordenId);
        if (!orden) {
            const err = new Error("Orden de producción no encontrada");
            err.statusCode = 404;
            throw err;
        }
        if (orden.estaAnulada()) {
            const err = new Error("No se puede reasignar empleados en una orden anulada");
            err.statusCode = 422;
            throw err;
        }

        if (!motivo || String(motivo).trim().length < 5) {
            const err = new Error("La justificación del cambio es requerida (mínimo 5 caracteres)");
            err.statusCode = 422;
            throw err;
        }

        const empleadoAnteriorId = orden.empleadoAsignadoId;

        const nuevoEmpleado = await this.userRepository.findById(nuevoEmpleadoId);
        if (!nuevoEmpleado) {
            const err = new Error("Empleado no encontrado");
            err.statusCode = 404;
            throw err;
        }
        if (nuevoEmpleado.estado === false) {
            const err = new Error("El empleado seleccionado está inactivo");
            err.statusCode = 422;
            throw err;
        }

        const normalizar = (s) => (s || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (normalizar(nuevoEmpleado.rolNombre) !== "empleado") {
            const err = new Error("Solo se pueden asignar usuarios con rol \"Empleado\"");
            err.statusCode = 422;
            throw err;
        }

        const cargosEmpleado = (Array.isArray(nuevoEmpleado.cargo) ? nuevoEmpleado.cargo : [nuevoEmpleado.cargo])
            .map(normalizar)
            .filter(Boolean);
        const etapaActual = normalizar(orden.estado);
        if (!cargosEmpleado.includes(etapaActual)) {
            const err = new Error(
                `El empleado debe tener el cargo "${orden.estado}" para asignarlo a esta etapa`,
            );
            err.statusCode = 422;
            throw err;
        }

        if (orden.sedeId && String(nuevoEmpleado.sedeId) !== String(orden.sedeId)) {
            const err = new Error("El empleado debe pertenecer a la misma sede que la producción");
            err.statusCode = 422;
            throw err;
        }

        if (String(nuevoEmpleadoId) === String(empleadoAnteriorId || "")) {
            const err = new Error("El empleado seleccionado ya está asignado a esta orden");
            err.statusCode = 422;
            throw err;
        }

        const actualizado = await this.productionRepository.update(ordenId, {
            empleadoAsignadoId: nuevoEmpleadoId,
        });

        const empleadoAnterior = empleadoAnteriorId
            ? await this.userRepository.findById(empleadoAnteriorId).catch(() => null)
            : null;

        const nombreAnterior = empleadoAnterior?.nombreCompleto || "Sin asignar";
        const nombreNuevo = nuevoEmpleado.nombreCompleto;
        const justificacion = String(motivo).trim();

        await this.productionRepository.agregarHistorial(
            ordenId,
            `Reasignado de ${nombreAnterior} a ${nombreNuevo}. Motivo: ${justificacion}`,
            null,
            null,
            orden.estado,
        );

        if (nuevoEmpleado.correo) {
            sendProductionAssignedEmail({
                nombreCompleto: nuevoEmpleado.nombreCompleto,
                correo: nuevoEmpleado.correo,
                numeroOrden: actualizado.numero_orden,
                etapa: orden.estado,
            }).catch((err) => {
                console.error("No se pudo enviar el correo de reasignación:", err.message);
            });
        }

        if (empleadoAnterior?.correo) {
            sendProductionAssignedEmail({
                nombreCompleto: empleadoAnterior.nombreCompleto,
                correo: empleadoAnterior.correo,
                numeroOrden: actualizado.numero_orden,
                etapa: orden.estado,
            }).catch((err) => {
                console.error("No se pudo enviar el correo de notificación de desasignación:", err.message);
            });
        }

        return actualizado.toJSON();
    }
}

module.exports = ReasignarEmpleadoProduccion;
