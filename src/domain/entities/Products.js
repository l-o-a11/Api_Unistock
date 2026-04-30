/**
 * Products.js
 * 
 * Entidad de Dominio para Productos.
 * Representa un producto registrado en el sistema.
 * 
 * Entidad pura del dominio sin dependencias externas.
 * 
 * @class Products
 * @author Unistock Team
 * 
 * @property {number} id - ID único del producto
 * @property {number} id_categorias - ID de la categoría a la que pertenece
 * @property {string} imagenes_Url - URLs de las imágenes del producto
 * @property {string} referencia - Referencia del producto
 * @property {string} nombre - Nombre del producto
 * @property {number} precio - Precio del producto
 * @property {number} stock - Cantidad de productos en stock
 * @property {boolean} estado - Estado del producto 
 */

class Products {
  /**
   * Crea nueva instancia de Products
   * @param {Object} data - Datos del producto
   * @param {number} data.id - ID único
   * @param {number} data.id_categorias - ID de la categoría a la que pertenece
   * @param {string} data.imagenes_Url - URLs de las imágenes del producto
   * @param {string} data.referencia - Referencia del producto
   * @param {string} data.nombre - Nombre del producto
   * @param {number} data.precio - Precio del producto
   * @param {number} data.stock - Cantidad de productos en stock
   * @param {boolean} data.estado - Estado del producto
   */
  constructor({
    id,
    id_categorias,
    imagenes_Url,
    referencia,
    nombre,
    precio,
    stock,
    estado,
  }) {
    this.id = id;
    this.id_categorias = id_categorias;
    this.imagenes_Url = imagenes_Url;
    this.referencia = referencia;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
    this.estado = estado;
  }

  /**
   * Convierte a JSON para respuestas HTTP
   * @returns {Object} Datos de la categoría
   */
  toJSON() {
    return {
      id: this.id,
      id_categorias: this.id_categorias,
      imagenes_Url: this.imagenes_Url,
      referencia: this.referencia,
      nombre: this.nombre,
      precio: this.precio,
      stock: this.stock,
      estado: this.estado,
    };
  }
}

module.exports = Products;