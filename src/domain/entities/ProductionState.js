// domain/entities/ProductionState.js

class ProductionState {
  constructor({
    id,
    nombre_estado,
    orden,
  }) {
    this.id = id;
    this.nombre_estado = nombre_estado;
    this.orden = orden;
  }

  toJSON() {
    return {
      id: this.id,
      nombre_estado: this.nombre_estado,
      orden: this.orden,
    };
  }
}

module.exports = ProductionState;
