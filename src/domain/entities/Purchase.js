// domain/entities/Purchase.js
// Entidad pura del dominio — sin dependencias externas.
// Define la forma canónica de una Compra y las reglas que le pertenecen.

class Purchase {
  constructor({
    id,
    fecha,
    proveedorId,
    total,
    estado = true,
    observaciones,
    numeroFactura,
  }) {
    this.id = id;
    this.fecha = fecha;
    this.proveedorId = proveedorId;
    this.total = total;
    this.estado = estado;
    this.observaciones = observaciones;
    this.numeroFactura = numeroFactura;
  }

  // Devuelve el objeto público
  toPublic() {
    return { ...this };
  }
}

module.exports = Purchase;