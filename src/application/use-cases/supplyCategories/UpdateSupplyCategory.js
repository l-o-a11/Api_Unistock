// application/use-cases/supplyCategories/UpdateSupplyCategory.js

class UpdateSupplyCategory {
  constructor(supplyCategoryRepository) {
    this.supplyCategoryRepository = supplyCategoryRepository;
  }

  async execute(id, data) {
    const existing = await this.supplyCategoryRepository.findById(id);
    if (!existing) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }

    const { nombre, estado } = data;

    // Name uniqueness if changed
    if (nombre && nombre !== existing.nombre) {
      const all = await this.supplyCategoryRepository.findAll();
      if (all.some((c) => c.nombre.toLowerCase() === nombre.toLowerCase() && c.id !== id)) {
        const error = new Error("Ya existe una categoría con ese nombre");
        error.statusCode = 409;
        throw error;
      }
    }

    const changes = {};
    if (nombre !== undefined) changes.nombre = nombre;
    if (estado !== undefined) changes.estado = estado;

    return this.supplyCategoryRepository.update(id, changes);
  }
}

module.exports = UpdateSupplyCategory;
