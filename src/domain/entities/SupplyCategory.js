// domain/entities/SupplyCategory.js
// Pure domain entity — no external dependencies.

class SupplyCategory {
  constructor({
    id,
    nombre,
    descripcion,
    estado = true,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.estado = estado;
  }

  toPublic() {
    return { ...this };
  }
}

module.exports = SupplyCategory;
