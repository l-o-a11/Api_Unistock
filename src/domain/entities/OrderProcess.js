// domain/entities/OrderProcess.js

class OrderProcess {
  constructor({
    id,
    id_detalle,
    id_estado,
    fecha,
    id_usuario,
  }) {
    this.id = id;
    this.id_detalle = id_detalle;
    this.id_estado = id_estado;
    this.fecha = fecha;
    this.id_usuario = id_usuario;
  }

  toJSON() {
    return {
      id: this.id,
      id_detalle: this.id_detalle,
      id_estado: this.id_estado,
      fecha: this.fecha,
      id_usuario: this.id_usuario,
    };
  }
}

module.exports = OrderProcess;
