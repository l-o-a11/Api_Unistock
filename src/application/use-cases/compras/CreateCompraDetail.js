// application/use-cases/compras/CreateCompraDetail.js

class CreateCompraDetail {
  constructor(compraDetailRepository) {
    this.compraDetailRepository = compraDetailRepository;
  }

  async execute(data) {
    const { compraId, productoId, cantidad, precioUnitario, subtotal } = data;

    // Validaciones básicas
    if (!compraId || !productoId || cantidad === undefined || precioUnitario === undefined) {
      const error = new Error("Datos incompletos para crear el detalle de compra");
      error.statusCode = 422;
      throw error;
    }

    const detail = this.compraDetailRepository.save({
      compraId: parseInt(compraId),
      productoId: parseInt(productoId),
      cantidad: parseFloat(cantidad),
      precioUnitario: parseFloat(precioUnitario),
      subtotal: subtotal !== undefined ? parseFloat(subtotal) : parseFloat(cantidad) * parseFloat(precioUnitario),
    });

    return detail.toPublic();
  }
}

module.exports = CreateCompraDetail;