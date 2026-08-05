// application/use-cases/product-categories/DeleteProductCategory.js

class DeleteProductCategory {
  constructor(productCategoryRepository, productRepository) {
    this.productCategoryRepository = productCategoryRepository;
    this.productRepository = productRepository;
  }

  async execute(id) {
    const category = await this.productCategoryRepository.findById(id);

    if (!category) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }

    // VALIDACION: No eliminar si tiene productos asociados
    const products = await this.productRepository.findByCategoryId(id);

    if (products && products.length > 0) {
      const error = new Error(
        "No se puede eliminar la categoría porque tiene productos asociados",
      );
      error.statusCode = 422;
      throw error;
    }

    await this.productCategoryRepository.delete(id);

    return { message: "Categoría eliminada correctamente" };
  }
}

module.exports = DeleteProductCategory;