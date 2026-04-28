// application/use-cases/product-categories/GetProductCategory.js

class GetProductCategory {
  constructor(productCategoryRepository) {
    this.productCategoryRepository = productCategoryRepository;
  }

  execute(filters = {}) {
    const categories = this.productCategoryRepository.findAll(filters);
    return categories.map((c) => c.toPublic());
  }
}