// domain/entities/ThirdPartyAssignment.js

class ThirdPartyAssignment {
  constructor({
    id,
    id_orden,
    id_tercero,
    cantidad,
    fecha,
  }) {
    this.id = id;
    this.id_orden = id_orden;
    this.id_tercero = id_tercero;
    this.cantidad = cantidad;
    this.fecha = fecha;
  }

  toJSON() {
    return {
      id: this.id,
      id_orden: this.id_orden,
      id_tercero: this.id_tercero,
      cantidad: this.cantidad,
      fecha: this.fecha,
    };
  }
}

module.exports = ThirdPartyAssignment;
