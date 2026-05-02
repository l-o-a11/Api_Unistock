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

const ESTADOS_VALIDOS = [
  "Diseño",
  "Ficha Técnica",
  "Corte",
  "Compras",
  "Producción",
  "Anulada",
];

class Production {
  /**
   * Crea nueva instancia de Production
   * @param {Object} data - Datos de la orden
   * @param {string}  data.id                - ID único (MongoDB ObjectId)
   * @param {number}  data.numero_orden       - Número correlativo de la orden
   * @param {Date}    data.fecha_creacion     - Fecha de creación
   * @param {Date}    data.fecha_entrega      - Fecha de entrega comprometida
   * @param {string}  data.cliente            - Nombre del cliente
   * @param {string}  data.id_usuario         - ID del usuario que creó la orden
   * @param {string}  data.estado             - Estado actual del flujo
   * @param {string}  [data.motivo_anulacion] - Motivo cuando se anula
   * @param {Array}   [data.historial]        - Historial de cambios de estado
   */
  constructor({
    id,
    numero_orden,
    fecha_creacion,
    fecha_entrega,
    cliente,
    id_usuario,
    estado = "Diseño",
    motivo_anulacion = null,
    historial = [],
  }) {
    this.id = id;
    this.numero_orden = numero_orden;
    this.fecha_creacion = fecha_creacion;
    this.fecha_entrega = fecha_entrega;
    this.cliente = cliente;
    this.id_usuario = id_usuario;
    this.estado = estado;
    this.motivo_anulacion = motivo_anulacion;
    this.historial = historial;
  }

  /** Devuelve true si la orden ya está anulada */
  estaAnulada() {
    return this.estado === "Anulada";
  }

  /**
   * Convierte a JSON para respuestas HTTP
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      numero_orden: this.numero_orden,
      fecha_creacion: this.fecha_creacion,
      fecha_entrega: this.fecha_entrega,
      cliente: this.cliente,
      id_usuario: this.id_usuario,
      estado: this.estado,
      motivo_anulacion: this.motivo_anulacion,
      historial: this.historial,
    };
  }
}

Production.ESTADOS_VALIDOS = ESTADOS_VALIDOS;

module.exports = Production;
