// application/use-cases/production/AsignarEmpleadoProduccion.js
const { sendProductionAssignedEmail } = require("../../../shared/utils/emailService");

/**
 * Asigna un empleado a la ETAPA ACTUAL de una orden de producción.
 * Valida que el rol del empleado coincida exactamente (sin distinguir
 * mayúsculas) con el nombre de la etapa — ej. para asignar en la etapa
 * "Ficha Técnica" el empleado debe tener un rol literalmente llamado
 * "Ficha Técnica". Esto requiere que los roles del sistema se llamen
 * igual que las etapas del flujo (Diseño, Ficha Técnica, Corte, Compras,
 * Producción, Recepción) para que el selector tenga candidatos.
 */
class AsignarEmpleadoProduccion {
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
            const err = new Error("No se puede asignar empleados a una orden anulada");
            err.statusCode = 422;
            throw err;
        }

        const empleado = await this.userRepository.findById(empleadoId);
        if (!empleado) {
            const err = new Error("Empleado no encontrado");
            err.statusCode = 404;
            throw err;
        }
        if (empleado.estado === false) {
            const err = new Error("El empleado seleccionado está inactivo");
            err.statusCode = 422;
            throw err;
        }

        // Se ignoran tildes/acentos además de mayúsculas — "Ficha Tecnica" y
        // "Ficha Técnica" deben tratarse como el mismo nombre de etapa/rol.
        const normalizar = (s) => (s || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const rolEmpleado = normalizar(empleado.rolNombre);
        const etapaActual = normalizar(orden.estado);
        if (rolEmpleado !== etapaActual) {
            const err = new Error(
                `El empleado debe tener el rol "${orden.estado}" para asignarlo a esta etapa`,
            );
            err.statusCode = 422;
            throw err;
        }

        // El empleado debe pertenecer a la MISMA sede que la producción — un
        // admin no puede asignar empleados de otra sede a su orden.
        if (orden.sedeId && String(empleado.sedeId) !== String(orden.sedeId)) {
            const err = new Error("El empleado debe pertenecer a la misma sede que la producción");
            err.statusCode = 422;
            throw err;
        }

        const actualizado = await this.productionRepository.update(ordenId, {
            empleadoAsignadoId: empleadoId,
        });

        if (empleado.correo) {
            // Fire-and-forget: un fallo de correo no debe bloquear la asignación.
            sendProductionAssignedEmail({
                nombreCompleto: empleado.nombreCompleto,
                correo: empleado.correo,
                numeroOrden: actualizado.numero_orden,
                etapa: orden.estado,
            }).catch((err) => {
                console.error("No se pudo enviar el correo de asignación:", err.message);
            });
        }

        return actualizado.toJSON();
    }
}

module.exports = AsignarEmpleadoProduccion;