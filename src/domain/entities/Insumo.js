// domain/entities/Insumo.js
// Entidad pura del dominio — sin dependencias externas.
// Define la forma canónica de un Insumo y las reglas que le pertenecen.

class Insumo {
  constructor({
    id,
    nombre,
    categoria,
    stock = 0,
    valor_medida,
    medida,
    estado = true,
    propiedades = [],
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.categoria = categoria;
    this.stock = stock;
    this.valor_medida = valor_medida;
    this.medida = medida;
    this.estado = estado;
    this.propiedades = propiedades;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Devuelve el objeto público
  toPublic() {
    return { ...this };
  }
}

module.exports = Insumo;