// application/use-cases/purchases/CreatePurchase.js

class CreatePurchase {
  constructor(purchaseRepository) {
    this.purchaseRepository = purchaseRepository;
  }

  async execute(data) {
    const { fecha, proveedorId, total, observaciones, numeroFactura } = data;

    // Validaciones básicas
    if (!fecha || !proveedorId || total === undefined || !numeroFactura) {
      const error = new Error("Faltan campos requeridos: fecha, proveedorId, total, numeroFactura");
      error.statusCode = 422;
      throw error;
    }

    // Duplicado de factura
    const existente = await this.purchaseRepository.findByNumeroFactura(numeroFactura.trim());
    if (existente) {
      const error = new Error(`Ya existe una compra con la factura "${numeroFactura}"`);
      error.statusCode = 409;
      throw error;
    }

    const purchase = await this.purchaseRepository.create({
      fecha,
      proveedorId,           // ObjectId string — Mongoose lo castea solo
      total: parseFloat(total),
      anulada: false,
      observaciones,
      numeroFactura: numeroFactura.trim(),
      motivoAnulacion: null,
      fechaAnulacion: null,
    });

    return purchase.toPublic();
  }
}

module.exports = CreatePurchase;