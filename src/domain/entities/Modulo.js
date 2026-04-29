// domain/entities/Modulo.js

class Modulo {
  constructor({
    id,
    nombre,
    estado = true,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.estado = estado;
  }

  toPublic() {
    return { ...this };
  }
}

module.exports = Modulo;
