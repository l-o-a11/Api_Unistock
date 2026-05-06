// domain/entities/Supply.js
// Pure domain entity — no external dependencies.

class Supply {
  constructor({
    id,
    nombre,
    categoria,
    stock = 0,
    valor_medida,
    medida,
    imagenes_Url,
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
    this.imagenes_Url = imagenes_Url;
    this.estado = estado;
    this.propiedades = propiedades;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toPublic() {
    return { ...this };
  }
}

module.exports = Supply;
