/**
 * TechnicalSpecifications.js
 * 
 * Entidad de Dominio para Fichas Técnicas.
 * Representa la información técnica de un producto registrado en el sistema.
 * 
 * Entidad pura del dominio sin dependencias externas.
 * 
 * @class TechnicalSpecifications
 * @author Unistock Team
 * 
 * @property {number} id - ID único del producto
 * @property {number} id_productos - ID del producto al que pertenece
 * @property {string} responsable - Responsable del producto
 * @property {string} fecha_inicio - Fecha de inicio del producto
 * @property {string} fecha_fin - Fecha de finalización del producto
 * @property {number} versiones - Número de versiones de la ficha técnica
 * @property {boolean} descripciones - Descripciones técnicas del producto
 */

class TechnicalSpecifications {
  /**
   * Crea nueva instancia de TechnicalSpecifications
   * @param {Object} data - Datos de la ficha técnica
   * @param {number} data.id - ID único
   * @param {number} data.id_productos - ID del producto al que pertenece
   * @param {string} data.responsable - Responsable del producto
   * @param {string} data.fecha_inicio - Fecha de inicio del producto
   * @param {string} data.fecha_fin - Fecha de finalización del producto
   * @param {number} data.versiones - Número de versiones de la ficha técnica
   * @param {boolean} data.descripciones - Descripciones técnicas del producto
   */
  constructor({
    id,
    id_productos,
    responsable,
    fecha_inicio,
    fecha_fin,
    versiones,
    descripciones,
  }) {
    this.id = id;
    this.id_productos = id_productos;
    this.responsable = responsable;
    this.fecha_inicio = fecha_inicio;
    this.fecha_fin = fecha_fin;
    this.versiones = versiones;
    this.descripciones = descripciones;
  }

  /**
   * Convierte a JSON para respuestas HTTP
   * @returns {Object} Datos de la categoría
   */
  toJSON() {
    return {
      id: this.id,
      id_productos: this.id_productos,
      responsable: this.responsable,
      fecha_inicio: this.fecha_inicio,
      fecha_fin: this.fecha_fin,
      versiones: this.versiones,
      descripciones: this.descripciones,
      estado: this.estado,
    };
  }
}

module.exports = TechnicalSpecifications;