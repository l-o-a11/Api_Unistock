// application/use-cases/product-categories/CreateProductCategory.js
class CreateProductCategory {
  constructor(productCategoryRepository) {
    this.productCategoryRepository = productCategoryRepository;
  }

  async execute(data) {
    const { nombre, descripcion } = data;

    // Validaciones
    if (!nombre) {
      const error = new Error("El nombre es obligatorio");
      error.statusCode = 400;
      throw error;
    }

    if (!descripcion) {
      const error = new Error("La descripción es obligatoria");
      error.statusCode = 400;
      throw error;
    }

    // Unicidad
    const existing = await this.productCategoryRepository.findByName(nombre);
    if (existing) {
      const error = new Error("Categoría ya existente");
      error.statusCode = 409;
      throw error;
    }

    // Crear
    const category = await this.productCategoryRepository.save({
      nombre: nombre.trim(),
      descripcion: descripcion || "",
    });

    return category;
  }
}

module.exports = CreateProductCategory;