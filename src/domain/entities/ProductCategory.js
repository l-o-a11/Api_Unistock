/**
 * ProductCategory.js
 * 
 * Entidad de Dominio para Categorías de Productos.
 * Representa una categoría de producto registrada en el sistema.
 * 
 * Entidad pura del dominio sin dependencias externas.
 * 
 * @class ProductCategory
 * @author Unistock Team
 * 
 * @property {number} id - ID único de la categoría
 * @property {string} nombre - Nombre de la categoría
 * @property {string} descripción - Descripción de la categoría
 * @property {number} cantidad_productos - Cantidad de productos en esta categoría
 * @property {number} productos_disponibles - Cantidad de productos disponibles en esta categoría
 * @property {boolean} estado - Estado de la categoría (Generalmente activa)
 */

// domain/entities/ProductCategory.js
class ProductCategory {
  constructor({ 
    id,
    nombre,
    descripcion,
    cantidad_productos,
    productos_disponibles,
    estado,
    createdAt,
    updatedAt,
  }) {
    this.id                   = id;
    this.nombre               = nombre;
    this.descripcion          = descripcion          ?? "";
    this.cantidad_productos   = cantidad_productos   ?? 0;
    this.productos_disponibles = productos_disponibles ?? 0;
    this.estado               = estado               ?? true;
    this.createdAt            = createdAt;
    this.updatedAt            = updatedAt;
  }

  toJSON() {
    return {
      id:                    this.id,
      nombre:                this.nombre,
      descripcion:           this.descripcion,
      cantidad_productos:    this.cantidad_productos,
      productos_disponibles: this.productos_disponibles,
      estado:                this.estado,
      createdAt:             this.createdAt,
      updatedAt:             this.updatedAt,
    };
  }
}

module.exports = ProductCategory;