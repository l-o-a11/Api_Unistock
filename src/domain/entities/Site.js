// domain/entities/Site.js
// Entidad pura del dominio. Sin dependencias externas.

class Site {
  constructor({ id, nombre, ciudad, barrio, direccion, telefono, estado = true, createdAt, updatedAt }) {
    this.id        = id;
    this.nombre    = nombre;
    this.ciudad    = ciudad;
    this.barrio    = barrio;
    this.direccion = direccion;
    this.telefono  = telefono;
    this.estado    = estado;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toggleEstado() {
    this.estado = !this.estado;
  }

  toJSON() {
    return {
      id:        this.id,
      nombre:    this.nombre,
      ciudad:    this.ciudad,
      barrio:    this.barrio,
      direccion: this.direccion,
      telefono:  this.telefono,
      estado:    this.estado,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Site;
