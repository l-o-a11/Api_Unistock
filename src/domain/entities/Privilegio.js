// domain/entities/Privilegio.js

class Privilegio {
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

module.exports = Privilegio;
