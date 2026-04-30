// application/use-cases/purchases/CreatePurchase.js

class CreatePurchase {
  constructor(purchaseRepository) {
    this.purchaseRepository = purchaseRepository;
  }

  async execute(data) {
    const { fecha, proveedorId, total, estado = true, observaciones, numeroFactura } = data;

    // Validaciones básicas
    if (!fecha || !proveedorId || total === undefined) {
      const error = new Error("Datos incompletos para crear la compra");
      error.statusCode = 422;
      throw error;
    }

    // Aquí podrías validar que el proveedor existe, etc.
    // Por ahora, asumimos que sí.

    const purchase = this.purchaseRepository.save({
      fecha,
      proveedorId: parseInt(proveedorId),
      total: parseFloat(total),
      estado,
      observaciones,
      numeroFactura,
    });

    return purchase.toPublic();
  }
}

module.exports = CreatePurchase;