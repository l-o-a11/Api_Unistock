// application/use-cases/product-categories/UpdateProductCategory.js
class UpdateProductCategory {
  constructor(productCategoryRepository) {
    this.productCategoryRepository = productCategoryRepository;
  }

  async execute(id, data) {
    const { nombre, descripcion } = data;

    const category = await this.productCategoryRepository.findById(id);

    if (!category) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }

    // Validar nombre único si cambia
    if (nombre && nombre !== category.nombre) {
      const existing = await this.productCategoryRepository.findByName(nombre);
      if (existing) {
        const error = new Error("Categoría ya existente");
        error.statusCode = 409;
        throw error;
      }
    }

    const updated = await this.productCategoryRepository.update(id, {
      nombre: nombre ? nombre.trim() : category.nombre,
      descripcion: descripcion !== undefined ? descripcion : category.descripcion,
    });

    return updated;
  }
}

module.exports = UpdateProductCategory;