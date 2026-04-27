/**
 * Production.js
 * 
 * Entidad de Dominio para Órdenes de Producción.
 * Representa una orden de producción registrada en el sistema.
 * 
 * Entidad pura del dominio sin dependencias externas.
 * 
 * @class Production
 * @author Unistock Team
 * 
 * @property {number} id - ID único de la orden
 * @property {Date} fecha_creacion - Fecha de creación
 * @property {Date} fecha_entrega - Fecha de entrega comprometida
 * @property {string} cliente - Nombre del cliente
 * @property {number} id_usuario - ID del usuario que creó la orden
 */

class Production {
  /**
   * Crea nueva instancia de Production
   * @param {Object} data - Datos de la orden
   * @param {number} data.id - ID único
   * @param {Date} data.fecha_creacion - Fecha creación
   * @param {Date} data.fecha_entrega - Fecha entrega
   * @param {string} data.cliente - Nombre cliente
   * @param {number} data.id_usuario - Usuario responsable
   */
  constructor({
    id,
    fecha_creacion,
    fecha_entrega,
    cliente,
    id_usuario,
  }) {
    this.id = id;
    this.fecha_creacion = fecha_creacion;
    this.fecha_entrega = fecha_entrega;
    this.cliente = cliente;
    this.id_usuario = id_usuario;
  }

  /**
   * Convierte a JSON para respuestas HTTP
   * @returns {Object} Datos de la orden
   */
  toJSON() {
    return {
      id: this.id,
      fecha_creacion: this.fecha_creacion,
      fecha_entrega: this.fecha_entrega,
      cliente: this.cliente,
      id_usuario: this.id_usuario,
    };
  }
}

module.exports = Production;
