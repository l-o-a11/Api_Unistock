// domain/entities/Purchase.js
// Entidad pura del dominio — sin dependencias externas.

class Purchase {
  constructor({
    id,
    fecha,
    proveedorId,
    total,
    anulada = false,
    observaciones,
    numeroFactura,
    motivoAnulacion = null,
    fechaAnulacion = null,
  }) {
    this.id = id;
    this.fecha = fecha;
    this.proveedorId = proveedorId;
    this.total = total;
    this.anulada = anulada;
    this.observaciones = observaciones;
    this.numeroFactura = numeroFactura;
    this.motivoAnulacion = motivoAnulacion;
    this.fechaAnulacion = fechaAnulacion;
  }

  estaAnulada() {
    return this.anulada === true;
  }

  toPublic() {
    return { ...this };
  }
}

module.exports = Purchase;