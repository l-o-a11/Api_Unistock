// application/use-cases/production/GetEmployeeWorkload.js

/**
 * Devuelve los empleados (rol "Empleado", activos) que tienen el CARGO
 * solicitado, junto con cuántas producciones activas tienen asignadas
 * ahora mismo (empleadoAsignadoId en órdenes que no estén Anulada ni
 * Enviado). Se usa para el selector de "Asignar empleado responsable"
 * en el detalle de producción — para no sobrecargar siempre al mismo.
 */
class GetEmployeeWorkload {
    constructor(userRepository, productionRepository) {
        this.userRepository = userRepository;
        this.productionRepository = productionRepository;
    }

    async execute(cargo) {
        const normalizar = (s) => (s || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cargoNorm = normalizar(cargo);

        const allUsers = await this.userRepository.findAll({});
        const empleados = (allUsers || []).filter((u) => {
            if (u.estado === false) return false;
            if (normalizar(u.rolNombre) !== "empleado") return false;
            if (!cargoNorm) return true;
            return (u.cargos || []).some((c) => normalizar(c) === cargoNorm);
        });

        const ordenes = await this.productionRepository.findAll({});
        const counts = {};
        (ordenes || []).forEach((o) => {
            const empId = o.empleadoAsignadoId;
            if (!empId || o.estado === "Anulada" || o.estado === "Enviado") return;
            const key = String(empId);
            counts[key] = (counts[key] || 0) + 1;
        });

        return empleados.map((e) => ({
            id: e.id,
            nombreCompleto: e.nombreCompleto,
            produccionesAsignadas: counts[String(e.id)] || 0,
        }));
    }
}

module.exports = GetEmployeeWorkload;