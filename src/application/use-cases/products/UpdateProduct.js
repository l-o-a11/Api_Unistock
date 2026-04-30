// application/use-cases/products/UpdateProduct.js
class UpdateProduct {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(id, data) {
    const { imagenes_Url, referencia, nombre, precio, stock } = data;

    const product = await this.productRepository.findById(id);

    if (!product) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // Validar nombre único si cambia
    if (nombre && nombre !== product.nombre) {
      const existing = await this.productRepository.findByName(nombre);
      if (existing) {
        const error = new Error("Producto ya existente");
        error.statusCode = 409;
        throw error;
      }
    }

    const updated = await this.productRepository.update(id, {
      imagenes_Url: imagenes_Url !== undefined ? imagenes_Url : product.imagenes_Url,
      referencia: referencia !== undefined ? referencia : product.referencia,
      nombre: nombre ? nombre.trim() : product.nombre,
      precio: precio !== undefined ? precio : product.precio,
      stock: stock !== undefined ? stock : product.stock
    });

    return updated;
  }
}

module.exports = UpdateProduct;