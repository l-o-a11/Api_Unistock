// application/use-cases/products/GetProductById.js

class GetProductById {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  execute(id) {
    const product = this.productRepository.findById(id);

    if (!product) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return product.toPublic();
  }
}