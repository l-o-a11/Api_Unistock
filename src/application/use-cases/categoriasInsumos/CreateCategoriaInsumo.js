// application/use-cases/categoriasInsumos/CreateCategoriaInsumo.js

class CreateCategoriaInsumo {
  constructor(categoriaInsumoRepository) {
    this.categoriaInsumoRepository = categoriaInsumoRepository;
  }

  async execute(data) {
    const {
      nombre,
      descripcion,
    } = data;

    // Unicidad de nombre
    if (this.categoriaInsumoRepository.findAll().some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
      const error = new Error("Ya existe una categoría con ese nombre");
      error.statusCode = 409;
      throw error;
    }

    // Validaciones básicas
    if (!nombre) {
      const error = new Error("El nombre es requerido");
      error.statusCode = 422;
      throw error;
    }

    return this.categoriaInsumoRepository.save({
      nombre,
      descripcion: descripcion || '',
      estado: true,
    });
  }
}

module.exports = CreateCategoriaInsumo;