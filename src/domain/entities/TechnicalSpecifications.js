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
    client,
    ref,
    type,
    description,
    observations,
    createdBy,
    image,
    fabrics,
    cups,
    closures,
    accessories,
    measurements,
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
    this.client = client;
    this.ref = ref;
    this.type = type;
    this.description = description;
    this.observations = observations;
    this.createdBy = createdBy;
    this.image = image;
    this.fabrics = fabrics;
    this.cups = cups;
    this.closures = closures;
    this.accessories = accessories;
    this.measurements = measurements;
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
      client: this.client,
      ref: this.ref,
      type: this.type,
      description: this.description,
      observations: this.observations,
      createdBy: this.createdBy,
      image: this.image,
      fabrics: this.fabrics,
      cups: this.cups,
      closures: this.closures,
      accessories: this.accessories,
      measurements: this.measurements,
      estado: this.estado,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = TechnicalSpecifications;