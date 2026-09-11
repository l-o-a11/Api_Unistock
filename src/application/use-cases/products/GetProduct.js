// application/use-cases/products/GetProduct.js

class GetProduct {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(filters = {}) {
    const products = await this.productRepository.findAll(filters);
    return products.map((p) => p.toJSON());
  }
}

module.exports = GetProduct;