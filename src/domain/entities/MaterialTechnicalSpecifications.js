/**
 * MaterialTechnicalSpecifications.js
 * 
 * Entidad de Dominio para Materiales De Las Fichas Técnicas.
 * Representa la información técnica de un producto registrado en el sistema.
 * 
 * Entidad pura del dominio sin dependencias externas.
 * 
 * @class MaterialTechnicalSpecifications
 * @author Unistock Team
 * 
 * @property {number} id - ID único del producto
 * @property {number} id_insumos - ID del insumo que se utilizo
 * @property {number} id_ficha_tecnica - ID de la ficha técnica a la que pertenece
 * @property {number} id_medida - ID de la medida utilizada
 * @property {string} cantidades - Número de cantidades del insumo utilizado
 */

class MaterialTechnicalSpecifications {
  /**
   * Crea nueva instancia de TechnicalSpecifications
   * @param {Object} data - Datos de la ficha técnica
   * @param {number} data.id - ID único
   * @param {number} data.id_insumos - ID del insumo que se utilizo
   * @param {number} data.id_ficha_tecnica - ID de la ficha técnica a la que pertenece
   * @param {number} data.id_medida - ID de la medida utilizada
   * @param {string} data.cantidades - Número de cantidades del insumo utilizado
   */
  constructor({
    id,
    id_insumos,
    id_ficha_tecnica,
    id_medida,
    cantidades,
  }) {
    this.id = id;
    this.id_insumos = id_insumos;
    this.id_ficha_tecnica = id_ficha_tecnica;
    this.id_medida = id_medida;
    this.cantidades = cantidades;
  }

  /**
   * Convierte a JSON para respuestas HTTP
   * @returns {Object} Datos de la categoría
   */
  toJSON() {
    return {
      id: this.id,
      id_insumos: this.id_insumos,
      id_ficha_tecnica: this.id_ficha_tecnica,
      id_medida: this.id_medida,
      cantidades: this.cantidades,
    };
  }
}

module.exports = MaterialTechnicalSpecifications;