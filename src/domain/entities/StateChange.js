// domain/entities/StateChange.js

class StateChange {
  constructor({
    id,
    id_orden,
    id_estado,
    fecha,
    id_usuario,
  }) {
    this.id = id;
    this.id_orden = id_orden;
    this.id_estado = id_estado;
    this.fecha = fecha;
    this.id_usuario = id_usuario;
  }

  toJSON() {
    return {
      id: this.id,
      id_orden: this.id_orden,
      id_estado: this.id_estado,
      fecha: this.fecha,
      id_usuario: this.id_usuario,
    };
  }
}

module.exports = StateChange;
