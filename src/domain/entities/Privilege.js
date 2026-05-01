// domain/entities/Privilege.js
// Pure domain entity — no external dependencies.

class Privilege {
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

module.exports = Privilege;
