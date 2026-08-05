// domain/entities/HeadquarterTransfer.js

class HeadquarterTransfer {
  constructor({
    id,
    id_orden,
    id_sede_origen,
    id_sede_destino,
    cantidad,
    fecha,
  }) {
    this.id = id;
    this.id_orden = id_orden;
    this.id_sede_origen = id_sede_origen;
    this.id_sede_destino = id_sede_destino;
    this.cantidad = cantidad;
    this.fecha = fecha;
  }

  toJSON() {
    return {
      id: this.id,
      id_orden: this.id_orden,
      id_sede_origen: this.id_sede_origen,
      id_sede_destino: this.id_sede_destino,
      cantidad: this.cantidad,
      fecha: this.fecha,
    };
  }
}

module.exports = HeadquarterTransfer;
