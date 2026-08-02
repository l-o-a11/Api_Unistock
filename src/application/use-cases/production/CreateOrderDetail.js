// ─────────────────────────────────────────────────────────────────────────────
// src/application/use-cases/production/CreateOrderDetail.js
// ─────────────────────────────────────────────────────────────────────────────

class CreateOrderDetail {
  /**
   * @param {ProductionOrderDetailRepository} detailRepository
   * @param {ProductionRepository}            productionRepository
   */
  constructor(detailRepository, productionRepository) {
    this.detailRepo = detailRepository;
    this.prodRepo   = productionRepository;
  }

  async execute(data) {
    const { id_orden, id_producto, cantidad, color } = data;

    // ── Campos obligatorios ────────────────────────────────────────────────
    if (!id_orden || !id_producto || cantidad === undefined) {
      const err = new Error("Los campos id_orden, id_producto y cantidad son obligatorios");
      err.statusCode = 400;
      throw err;
    }

    const qty = Number(cantidad);
    if (isNaN(qty) || qty <= 0) {
      const err = new Error("cantidad debe ser un número mayor a 0");
      err.statusCode = 400;
      throw err;
    }

    // ── La orden debe existir y no estar anulada ───────────────────────────
    const orden = await this.prodRepo.findById(id_orden);
    if (!orden) {
      const err = new Error("La orden de producción no existe");
      err.statusCode = 404;
      throw err;
    }

    if (orden.estaAnulada()) {
      const err = new Error("No se pueden agregar detalles a una orden anulada");
      err.statusCode = 422;
      throw err;
    }

    const detail = await this.detailRepo.create({
      id_orden,
      id_producto,
      cantidad:  qty,
      color:     color?.trim() || null,
      estado:    true,
    });

    return detail.toJSON();
  }
}

module.exports = CreateOrderDetail;
