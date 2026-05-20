/**
 * Entidad de Dominio para Fichas Tecnicas.
 */
class TechnicalSpecifications {
  constructor({
    id,
    id_producto,
    id_productos,
    responsable,
    fecha_inicio,
    fecha_fin,
    versiones,
    descripciones,
    estado,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.id_producto = id_producto || id_productos;
    this.responsable = responsable;
    this.fecha_inicio = fecha_inicio;
    this.fecha_fin = fecha_fin;
    this.versiones = versiones;
    this.descripciones = descripciones;
    this.estado = estado;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      id_producto: this.id_producto,
      responsable: this.responsable,
      fecha_inicio: this.fecha_inicio,
      fecha_fin: this.fecha_fin,
      versiones: this.versiones,
      descripciones: this.descripciones,
      estado: this.estado,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = TechnicalSpecifications;