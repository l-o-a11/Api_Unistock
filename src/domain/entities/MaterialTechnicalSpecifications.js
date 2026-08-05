/**
 * Entidad de Dominio para Materiales de Fichas Tecnicas.
 */
class MaterialTechnicalSpecifications {
  constructor({
    id,
    id_producto,
    id_ficha_tecnica,
    id_insumo,
    id_insumos,
    id_medida,
    nombre,
    unidad,
    cantidades,
    precio_unitario,
    precio_total,
    observaciones,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.id_producto = id_producto;
    this.id_ficha_tecnica = id_ficha_tecnica;
    this.id_insumo = id_insumo || id_insumos;
    this.id_medida = id_medida;
    this.nombre = nombre;
    this.unidad = unidad;
    this.cantidades = cantidades;
    this.precio_unitario = precio_unitario ?? 0;
    this.precio_total = precio_total ?? 0;
    this.observaciones = observaciones;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      id_producto: this.id_producto,
      id_ficha_tecnica: this.id_ficha_tecnica,
      id_insumo: this.id_insumo,
      id_medida: this.id_medida,
      nombre: this.nombre,
      unidad: this.unidad,
      cantidades: this.cantidades,
      precio_unitario: this.precio_unitario,
      precio_total: this.precio_total,
      observaciones: this.observaciones,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = MaterialTechnicalSpecifications;