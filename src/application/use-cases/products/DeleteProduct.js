// application/use-cases/products/DeleteProduct.js

class DeleteProduct {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(id) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }

    await this.productRepository.delete(id);

    return { message: "Producto eliminado correctamente" };
  }
}

module.exports = DeleteProduct;