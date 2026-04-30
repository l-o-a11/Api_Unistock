// application/use-cases/supplyCategories/GetSupplyCategoryById.js

class GetSupplyCategoryById {
  constructor(supplyCategoryRepository) {
    this.supplyCategoryRepository = supplyCategoryRepository;
  }

  async execute(id) {
    const category = await this.supplyCategoryRepository.findById(id);
    if (!category) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }
    return category;
  }
}

module.exports = GetSupplyCategoryById;
