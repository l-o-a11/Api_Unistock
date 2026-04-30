// application/use-cases/sites/UpdateSite.js

class UpdateSite {
    constructor(siteRepository) {
        this.siteRepository = siteRepository;
    }

    async execute(id, data) {
        const existing = this.siteRepository.findById(id);
        if (!existing) {
            const error = new Error("Site no encontrada");
            error.statusCode = 404;
            throw error;
        }

        const {
            nombre,
            ciudad,
            barrio,
            direccion,
            telefono,
            estado,
        } = data;

        // Unicidad de nombre si cambió
        if (nombre && nombre !== existing.nombre && this.siteRepository.findAll().some(s => s.nombre.toLowerCase() === nombre.toLowerCase() && s.id !== parseInt(id))) {
            const error = new Error("Ya existe una site con ese nombre");
            error.statusCode = 409;
            throw error;
        }

        const changes = {};
        if (nombre !== undefined) changes.nombre = nombre;
        if (ciudad !== undefined) changes.ciudad = ciudad;
        if (barrio !== undefined) changes.barrio = barrio;
        if (direccion !== undefined) changes.direccion = direccion;
        if (telefono !== undefined) changes.telefono = telefono;
        if (estado !== undefined) changes.estado = estado;

        return this.siteRepository.update(id, changes);
    }
}

module.exports = UpdateSite;