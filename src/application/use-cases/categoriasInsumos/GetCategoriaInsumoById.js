// application/use-cases/categoriasInsumos/GetCategoriaInsumoById.js

class GetCategoriaInsumoById {
  constructor(categoriaInsumoRepository) {
    this.categoriaInsumoRepository = categoriaInsumoRepository;
  }

  execute(id) {
    const categoria = this.categoriaInsumoRepository.findById(id);
    if (!categoria) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }
    return categoria;
  }
}

module.exports = GetCategoriaInsumoById;