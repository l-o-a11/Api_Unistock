// application/use-cases/supplies/UpdateSupply.js
class UpdateSupply {
  constructor(supplyRepository) {
    this.supplyRepository = supplyRepository;
  }

  async execute(id, data) {
    const { nombre, categoria, valor_medida, medida, imagenes_Url, stock = 0, propiedades = [] } = data;

    const supply = await this.supplyRepository.findById(id);

    if (!supply) {
      const error = new Error("Insumo no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // Validar nombre único si cambia
    if (nombre && nombre !== supply.nombre) {
      const existing = await this.supplyRepository.findByName(nombre);
      if (existing) {
        const error = new Error("Insumo ya existente");
        error.statusCode = 409;
        throw error;
      }
    }

    const updated = await this.supplyRepository.update(id, {
      imagenes_Url: imagenes_Url !== undefined ? imagenes_Url : supply.imagenes_Url,
      categoria: categoria !== undefined ? categoria : supply.categoria,
      nombre: nombre ? nombre.trim() : supply.nombre,
      valor_medida: valor_medida !== undefined ? valor_medida : supply.valor_medida,
      medida: medida !== undefined ? medida : supply.medida,
      stock: stock !== undefined ? stock : supply.stock
    });

    return updated;
  }
}

module.exports = UpdateSupply;