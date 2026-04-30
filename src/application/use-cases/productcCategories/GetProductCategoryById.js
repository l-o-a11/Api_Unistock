// application/use-cases/product-categories/GetProductCategoryById.js

class GetProductCategoryById {
  constructor(productCategoryRepository) {
    this.productCategoryRepository = productCategoryRepository;
  }

  execute(id) {
    const category = this.productCategoryRepository.findById(id);

    if (!category) {
      const error = new Error("Categoría no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return category.toPublic();
  }
}