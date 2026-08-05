class CreateProduct {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(data) {
    const { id_categorias, imagenes_Url, referencia, nombre, precio, stock } = data;

    // Validaciones
    if (!id_categorias) {
      const error = new Error("id_categorias es obligatorio");
      error.statusCode = 400;
      throw error;
    }

    if (!imagenes_Url || !Array.isArray(imagenes_Url) || imagenes_Url.length === 0) {
      const error = new Error("Se requiere al menos una imagen");
      error.statusCode = 400;
      throw error;
    }
    
    if (!nombre) {
      const error = new Error("El nombre es obligatorio");
      error.statusCode = 400;
      throw error;
    }

    if (!referencia) {
      const error = new Error("La referencia es obligatoria");
      error.statusCode = 400;
      throw error;
    }

    if (!precio) {
      const error = new Error("El precio es obligatorio");
      error.statusCode = 400;
      throw error;
    }

    if (stock === undefined || stock === null) {
      const error = new Error("El stock es obligatorio");
      error.statusCode = 400;
      throw error;
    }

    // Unicidad
    const existing = await this.productRepository.findByName(nombre);
    if (existing) {
      const error = new Error("Producto ya existente");
      error.statusCode = 409;
      throw error;
    }

    // Crear
    const product = await this.productRepository.save({
      id_categorias,
      imagenes_Url: imagenes_Url,
      referencia: referencia.trim(),
      nombre: nombre.trim(),
      precio: precio,
      stock: stock,
      estado: true
    });

    return product;
  }
}

module.exports = CreateProduct;

