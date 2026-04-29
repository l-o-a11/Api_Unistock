// application/use-cases/categoriasInsumos/GetCategoriaInsumo.js

class GetCategoriaInsumo {
  constructor(categoriaInsumoRepository) {
    this.categoriaInsumoRepository = categoriaInsumoRepository;
  }

  execute(filters = {}) {
    return this.categoriaInsumoRepository.findAll(filters);
  }
}

module.exports = GetCategoriaInsumo;