// application/use-cases/supplyCategories/DeleteSupplyCategory.js

const mongoose = require("mongoose");

class DeleteSupplyCategory {
  constructor(supplyCategoryRepository, supplyRepository) {
    this.supplyCategoryRepository = supplyCategoryRepository;
    this.supplyRepository = supplyRepository;
  }

  async execute(id) {
    // FIX: validar formato de id antes de consultar
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("ID de categoría inválido");
      error.statusCode = 400;
      throw error;
    }

    const category = await this.supplyCategoryRepository.findById(id);
    if (!category) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }

    // FIX: findAll devuelve un array plano en este repositorio
    // Pasar estado:true explícitamente para buscar insumos activos
    const suppliesInCategory = await this.supplyRepository.findAll({
      categoria: id,
      estado: true,
    });

    // FIX: suppliesInCategory es un array, .length funciona correctamente
    if (Array.isArray(suppliesInCategory) && suppliesInCategory.length > 0) {
      const error = new Error(
        "No se puede eliminar la categoría porque tiene insumos activos asignados"
      );
      error.statusCode = 422;
      throw error;
    }

    // FIX: hard delete — el GET ya filtra por estado:true, soft delete dejaba
    // el registro visible. Se elimina físicamente.
    await this.supplyCategoryRepository.delete(id);
    return { deleted: true, id };
  }
}

module.exports = DeleteSupplyCategory;
