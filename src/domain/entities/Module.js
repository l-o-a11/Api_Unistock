// domain/entities/Module.js
// Pure domain entity — no external dependencies.

class Module {
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

module.exports = Module;
