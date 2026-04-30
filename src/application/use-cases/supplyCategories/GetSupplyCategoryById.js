// application/use-cases/supplyCategories/GetSupplyCategoryById.js

class GetSupplyCategoryById {
  constructor(supplyCategoryRepository) {
    this.supplyCategoryRepository = supplyCategoryRepository;
  }

  execute(id) {
    const categoria = this.supplyCategoryRepository.findById(id);
    if (!categoria) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }
    return categoria;
  }
}

module.exports = GetSupplyCategoryById;