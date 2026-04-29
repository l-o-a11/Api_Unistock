// domain/entities/CategoriaInsumo.js
// Entidad pura del dominio — sin dependencias externas.
// Define la forma canónica de una CategoriaInsumo y las reglas que le pertenecen.

class CategoriaInsumo {
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

  // Devuelve el objeto público
  toPublic() {
    return { ...this };
  }
}

module.exports = CategoriaInsumo;