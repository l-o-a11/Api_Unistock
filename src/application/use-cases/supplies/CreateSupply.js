// application/use-cases/supplies/CreateSupply.js

class CreateSupply {
  constructor(supplyRepository) {
    this.supplyRepository = supplyRepository;
  }

  async execute(data) {
    const { nombre, categoria, valor_medida, medida, imagenes_Url, stock = 0, propiedades = [] } = data;

    // Validations
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

    if (!imagenes_Url || !Array.isArray(imagenes_Url) || imagenes_Url.length === 0) {
      const error = new Error("Se requiere al menos una imagen");
      error.statusCode = 400;
      throw error;
    }

    // Name uniqueness
    const existing = await this.supplyRepository.findByName(nombre);
    if (existing) {
      const error = new Error("Insumo ya existente");
      error.statusCode = 409;
      throw error;
    }

    return this.supplyRepository.create({
      nombre: nombre.trim(),
      categoria,
      valor_medida,
      medida,
      imagenes_Url,
      stock,
      propiedades,
      estado: true,
    });
  }
}

module.exports = CreateSupply;
