// application/use-cases/sites/UpdateSites.js

class UpdateSite {
  constructor(siteRepository) {
    this.repo = siteRepository;
  }

  async execute(id, data) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const err = new Error("Sede no encontrada");
      err.statusCode = 404;
      throw err;
    }

    const { nombre, ciudad, barrio, direccion, telefono, estado } = data;

    // Unicidad de nombre si cambió
    if (nombre && nombre.trim() !== existing.nombre) {
      const dup = await this.repo.findByName(nombre.trim());
      if (dup && dup.id !== id) {
        const err = new Error(`Ya existe una sede con el nombre "${nombre}"`);
        err.statusCode = 409;
        throw err;
      }
    }

    const changes = {};
    if (nombre    !== undefined) changes.nombre    = nombre.trim();
    if (ciudad    !== undefined) changes.ciudad    = ciudad.trim();
    if (barrio    !== undefined) changes.barrio    = barrio.trim();
    if (direccion !== undefined) changes.direccion = direccion.trim();
    if (telefono  !== undefined) changes.telefono  = String(telefono).trim();
    if (estado    !== undefined) changes.estado    = estado;

    return this.repo.update(id, changes);
  }
}

module.exports = UpdateSite;
