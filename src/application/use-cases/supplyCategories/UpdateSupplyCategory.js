// application/use-cases/supplyCategories/UpdateSupplyCategory.js

class UpdateSupplyCategory {
  constructor(supplyCategoryRepository) {
    this.supplyCategoryRepository = supplyCategoryRepository;
  }

  async execute(id, data) {
    const existing = this.supplyCategoryRepository.findById(id);
    if (!existing) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }

    const {
      nombre,
      estado,
    } = data;

    // Unicidad de nombre si cambió
    if (nombre && nombre !== existing.nombre && this.supplyCategoryRepository.findAll().some(c => c.nombre.toLowerCase() === nombre.toLowerCase() && c.id !== parseInt(id))) {
      const error = new Error("Ya existe una categoría con ese nombre");
      error.statusCode = 409;
      throw error;
    }

    const changes = {};
    if (nombre !== undefined) changes.nombre = nombre;
    if (estado !== undefined) changes.estado = estado;

    return this.supplyCategoryRepository.update(id, changes);
  }
}

module.exports = UpdateSupplyCategory;