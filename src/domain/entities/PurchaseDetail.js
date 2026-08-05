// domain/entities/PurchaseDetail.js
// Entidad pura del dominio — sin dependencias externas.

class PurchaseDetail {
  constructor({
    id,
    compraId,
    productoId,
    insumoId,
    nombre,
    cantidad,
    precioUnitario,
    subtotal,
  }) {
    this.id = id;
    this.compraId = compraId;
    this.productoId = productoId ?? null;
    this.insumoId = insumoId ?? null;
    this.nombre = nombre ?? null;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.subtotal = subtotal;
  }

  toPublic() {
    return { ...this };
  }
}

module.exports = PurchaseDetail;