// application/use-cases/purchases/CreatePurchaseDetail.js

class CreatePurchaseDetail {
  constructor(purchaseDetailRepository) {
    this.purchaseDetailRepository = purchaseDetailRepository;
  }

  async execute(data) {
    const { purchaseId, productoId, cantidad, precioUnitario, subtotal } = data;

    // Validaciones básicas
    if (!purchaseId || !productoId || cantidad === undefined || precioUnitario === undefined) {
      const error = new Error("Datos incompletos para crear el detalle de purchase");
      error.statusCode = 422;
      throw error;
    }

    const detail = this.purchaseDetailRepository.save({
      purchaseId: parseInt(purchaseId),
      productoId: parseInt(productoId),
      cantidad: parseFloat(cantidad),
      precioUnitario: parseFloat(precioUnitario),
      subtotal: subtotal !== undefined ? parseFloat(subtotal) : parseFloat(cantidad) * parseFloat(precioUnitario),
    });

    return detail.toPublic();
  }
}

module.exports = CreatePurchaseDetail;