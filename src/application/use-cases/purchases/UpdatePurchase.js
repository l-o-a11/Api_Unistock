// application/use-cases/purchases/UpdatePurchase.js

class UpdatePurchase {
  constructor(purchaseRepository) {
    this.purchaseRepository = purchaseRepository;
  }

  execute(id, data) {
    const { fecha, proveedorId, total, estado, observaciones, numeroFactura } = data;

    // Validaciones básicas si es necesario

    const purchase = this.purchaseRepository.update(id, {
      fecha,
      proveedorId: proveedorId ? parseInt(proveedorId) : undefined,
      total: total !== undefined ? parseFloat(total) : undefined,
      estado,
      observaciones,
      numeroFactura,
    });

    if (!purchase) {
      const error = new Error("Compra no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return purchase.toPublic();
  }
}

module.exports = UpdatePurchase;