// application/use-cases/production/UpdateProduction.js

class UpdateProduction {
  constructor(productionRepository) {
    this.productionRepository = productionRepository;
  }

  async execute(id, data) {
    const existing = await this.productionRepository.findById(id);
    if (!existing) {
      const error = new Error("Orden de producción no encontrada");
      error.statusCode = 404;
      throw error;
    }

    if (existing.estaAnulada && existing.estaAnulada()) {
      const error = new Error("No se puede editar una orden anulada");
      error.statusCode = 422;
      throw error;
    }

    const { fecha_entrega, cliente, producto, referencia } = data;

    const changes = {};
    if (fecha_entrega) changes.fecha_entrega = fecha_entrega;
    if (cliente) changes.cliente = cliente.trim();
    if (producto) changes.producto = producto;
    if (referencia) changes.referencia = referencia;

    if (Object.keys(changes).length === 0) {
      return existing.toJSON ? existing.toJSON() : existing;
    }

    const updated = await this.productionRepository.update(id, changes);
    if (!updated) {
      const error = new Error("Orden de producción no encontrada");
      error.statusCode = 404;
      throw error;
    }
    return updated.toJSON();
  }
}

module.exports = UpdateProduction;
