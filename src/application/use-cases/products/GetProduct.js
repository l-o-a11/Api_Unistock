// application/use-cases/products/GetProduct.js

class GetProduct {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  execute(filters = {}) {
    const products = this.productRepository.findAll(filters);
    return products.map((p) => p.toPublic());
  }
}