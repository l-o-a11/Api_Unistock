// domain/entities/CompraDetail.js
// Entidad pura del dominio — sin dependencias externas.
// Define la forma canónica de un Detalle de Compra.

class CompraDetail {
  constructor({
    id,
    compraId,
    productoId,
    cantidad,
    precioUnitario,
    subtotal,
  }) {
    this.id = id;
    this.compraId = compraId;
    this.productoId = productoId;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.subtotal = subtotal;
  }

  // Devuelve el objeto público
  toPublic() {
    return { ...this };
  }
}

module.exports = CompraDetail;