// application/use-cases/categoriasInsumos/UpdateCategoriaInsumo.js

class UpdateCategoriaInsumo {
  constructor(categoriaInsumoRepository) {
    this.categoriaInsumoRepository = categoriaInsumoRepository;
  }

  async execute(id, data) {
    const existing = this.categoriaInsumoRepository.findById(id);
    if (!existing) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }

    const {
      nombre,
      descripcion,
      estado,
    } = data;

    // Unicidad de nombre si cambió
    if (nombre && nombre !== existing.nombre && this.categoriaInsumoRepository.findAll().some(c => c.nombre.toLowerCase() === nombre.toLowerCase() && c.id !== parseInt(id))) {
      const error = new Error("Ya existe una categoría con ese nombre");
      error.statusCode = 409;
      throw error;
    }

    const changes = {};
    if (nombre !== undefined) changes.nombre = nombre;
    if (descripcion !== undefined) changes.descripcion = descripcion;
    if (estado !== undefined) changes.estado = estado;

    return this.categoriaInsumoRepository.update(id, changes);
  }
}

module.exports = UpdateCategoriaInsumo;