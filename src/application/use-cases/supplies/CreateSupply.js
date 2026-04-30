// application/use-cases/supplies/CreateSupply.js
class CreateSupply {
  constructor(supplyRepository) {
    this.supplyRepository = supplyRepository;
  }

  async execute(data) {
    const { nombre, categoria, valor_medida, medida, imagenes_Url, stock = 0, propiedades = [] } = data;

    // Validaciones
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

    if (!categoria) {
      const error = new Error("La categoría es obligatoria");
      error.statusCode = 400;
      throw error;
    }

    if (!valor_medida) {
      const error = new Error("El valor de medida es obligatorio");
      error.statusCode = 400;
      throw error;
    }

    if (!medida) {
      const error = new Error("La medida es obligatoria");
      error.statusCode = 400;
      throw error;
    }

    if (stock === undefined || stock === null) {
      const error = new Error("El stock es obligatorio");
      error.statusCode = 400;
      throw error;
    }

    // Unicidad
    const existing = await this.supplyRepository.findByName(nombre);
    if (existing) {
      const error = new Error("Insumo ya existente");
      error.statusCode = 409;
      throw error;
    }

    // Crear
    const supply = await this.supplyRepository.save({
      imagenes_Url: imagenes_Url,
      referencia: referencia.trim(),
      nombre: nombre.trim(),
      precio: precio,
      stock: stock
    });

    return supply;
  }
}

module.exports = CreateSupply;