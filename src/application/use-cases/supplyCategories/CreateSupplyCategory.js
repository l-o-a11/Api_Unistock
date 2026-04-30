// application/use-cases/supplyCategories/CreateSupplyCategory.js

class CreateSupplyCategory {
  constructor(supplyCategoryRepository) {
    this.supplyCategoryRepository = supplyCategoryRepository;
  }

  async execute(data) {
    const {
      nombre,
      descripcion,
    } = data;

    // Unicidad de nombre
    if (this.supplyCategoryRepository.findAll().some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
      const error = new Error("Ya existe una categoría con ese nombre");
      error.statusCode = 409;
      throw error;
    }

    // Validaciones básicas
    if (!nombre) {
      const error = new Error("El nombre es requerido");
      error.statusCode = 422;
      throw error;
    }

    return this.supplyCategoryRepository.save({
      nombre,
      descripcion: descripcion || '',
      estado: true,
    });
  }
}

module.exports = CreateSupplyCategory;