// domain/entities/Rol.js
// Entidad pura del dominio — sin dependencias externas.
// Define la forma canónica de un Rol y las reglas que le pertenecen.

class Rol {
  constructor({
    id,
    nombre,
    descripcion,
    estado = true,
    permisos = [],
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.estado = estado;
    this.permisos = permisos;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Devuelve el objeto público
  toPublic() {
    return { ...this };
  }
}

module.exports = Rol;