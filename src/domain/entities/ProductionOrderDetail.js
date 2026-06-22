// domain/entities/ProductionOrderDetail.js

class ProductionOrderDetail {
  constructor({
    id,
    id_orden,
    id_producto,
    cantidad,
    color,
    estado = true,
  }) {
    this.id = id;
    this.id_orden = id_orden;
    this.id_producto = id_producto;
    this.cantidad = cantidad;
    this.color = color;
    this.estado = estado;
  }

  toJSON() {
    return {
      id: this.id,
      id_orden: this.id_orden,
      id_producto: this.id_producto,
      cantidad: this.cantidad,
      color: this.color,
      estado: this.estado,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = ProductionOrderDetail;
