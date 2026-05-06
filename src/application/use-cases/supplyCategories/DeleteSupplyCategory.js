// application/use-cases/supplyCategories/DeleteSupplyCategory.js

class DeleteSupplyCategory {
  constructor(supplyCategoryRepository, supplyRepository) {
    this.supplyCategoryRepository = supplyCategoryRepository;
    this.supplyRepository = supplyRepository;
  }

  async execute(id) {
    const category = await this.supplyCategoryRepository.findById(id);
    if (!category) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }

    // Check for active supplies in this category
    const suppliesInCategory = await this.supplyRepository.findAll({ categoria: id, estado: true });
    if (suppliesInCategory.length > 0) {
      const error = new Error("No se puede eliminar la categoría porque tiene insumos activos asignados");
      error.statusCode = 422;
      throw error;
    }

    // Soft delete
    return this.supplyCategoryRepository.update(id, { estado: false });
  }
}

module.exports = DeleteSupplyCategory;
