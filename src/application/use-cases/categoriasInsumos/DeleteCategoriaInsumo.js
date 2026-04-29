// application/use-cases/categoriasInsumos/DeleteCategoriaInsumo.js

class DeleteCategoriaInsumo {
  constructor(categoriaInsumoRepository, insumoRepository) {
    this.categoriaInsumoRepository = categoriaInsumoRepository;
    this.insumoRepository = insumoRepository;
  }

  async execute(id) {
    const categoria = this.categoriaInsumoRepository.findById(id);
    if (!categoria) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }

    // Verificar si hay insumos activos en esta categoría
    const insumosInCategoria = this.insumoRepository.findAll({ categoria: id, estado: true });
    if (insumosInCategoria.length > 0) {
      const error = new Error("No se puede eliminar la categoría porque tiene insumos activos asignados");
      error.statusCode = 422;
      throw error;
    }

    // Soft delete
    return this.categoriaInsumoRepository.update(id, { estado: false });
  }
}

module.exports = DeleteCategoriaInsumo;