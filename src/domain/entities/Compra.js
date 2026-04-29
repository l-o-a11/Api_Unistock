// domain/entities/Compra.js
// Entidad pura del dominio — sin dependencias externas.
// Define la forma canónica de una Compra y las reglas que le pertenecen.

class Compra {
  constructor({
    id,
    fecha,
    proveedorId,
    total,
    estado = true,
  }) {
    this.id = id;
    this.fecha = fecha;
    this.proveedorId = proveedorId;
    this.total = total;
    this.estado = estado;
  }

  // Devuelve el objeto público
  toPublic() {
    return { ...this };
  }
}

module.exports = Compra;