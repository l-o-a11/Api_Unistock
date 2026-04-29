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
 * @property {number} cantidad_producto - Cantidad de productos en esta categoría
 * @property {number} productos_disponibles - Cantidad de productos disponibles en esta categoría
 * @property {boolean} estado - Estado de la categoría (Generalmente activa)
 */

class ProductCategory {
  /**
   * Crea nueva instancia de ProductCategory
   * @param {Object} data - Datos de la categoría
   * @param {number} data.id - ID único
   * @param {string} data.nombre - Nombre de la categoría
   * @param {string} data.descripción - Descripción de la categoría
   * @param {number} data.cantidad_producto - Cantidad de productos en esta categoría
   * @param {number} data.productos_disponibles - Cantidad de productos disponibles en esta categoría
   * @param {boolean} data.estado - Estado de la categoría
   */
  constructor({
    id,
    nombre,
    descripción,
    cantidad_producto,
    productos_disponibles,
    estado,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.descripción = descripción;
    this.cantidad_producto = cantidad_producto;
    this.productos_disponibles = productos_disponibles;
    this.estado = estado;
  }

  /**
   * Convierte a JSON para respuestas HTTP
   * @returns {Object} Datos de la categoría
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripción: this.descripción,
      cantidad_producto: this.cantidad_producto,
      productos_disponibles: this.productos_disponibles,
      estado: this.estado,
    };
  }
}

module.exports = ProductCategory;