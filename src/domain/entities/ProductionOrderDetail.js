// domain/entities/ProductionOrderDetail.js

class ProductionOrderDetail {
  constructor({
    id,
    id_orden,
    id_producto,
    cantidad,
    color,
    estado = true,
    refCorte = null,
  }) {
    this.id = id;
    this.id_orden = id_orden;
    this.id_producto = id_producto;
    this.cantidad = cantidad;
    this.color = color;
    this.estado = estado;
    this.refCorte = refCorte;
  }

  toJSON() {
    return {
      id: this.id,
      id_orden: this.id_orden,
      id_producto: this.id_producto,
      cantidad: this.cantidad,
      color: this.color,
      estado: this.estado,
      refCorte: this.refCorte,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = ProductionOrderDetail;
