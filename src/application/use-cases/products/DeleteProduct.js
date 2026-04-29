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

    // VALIDACION: No eliminar si tiene fichas técnicas asociadas
    const products = await this.productRepository.findByCategoryId(id);

    if (products && products.length > 0) {
      const error = new Error(
        "No se puede eliminar el producto porque tiene más de una ficha técnica asociada",
      );
      error.statusCode = 422;
      throw error;
    }

    await this.productRepository.delete(id);

    return { message: "Producto eliminado correctamente" };
  }
}

module.exports = DeleteProduct;