/**
 * ThirdParties.js
 * 
 * Entidad de Dominio para Terceros.
 * Representa personas o empresas externas asignadas a órdenes de producción.
 * 
 * Entidad pura del dominio sin dependencias externas.
 * 
 * @class ThirdParties
 * @author Unistock Team
 * 
 * @property {number} id - ID único
 * @property {string} nombre - Nombre del tercero
 * @property {string} contacto - Persona de contacto
 * @property {string} barrio - Barrio de ubicación
 * @property {string} direccion - Dirección completa
 * @property {string} telefono - Teléfono
 * @property {boolean} estado - Estado (activo/inactivo)
 */

class ThirdParties {
  /**
   * Crea nueva instancia de ThirdParties
   * @param {Object} data - Datos del tercero
   * @param {number} data.id - ID único
   * @param {string} data.nombre - Nombre
   * @param {string} data.contacto - Contacto
   * @param {string} data.barrio - Barrio
   * @param {string} data.direccion - Dirección
   * @param {string} data.telefono - Teléfono
   * @param {boolean} [data.estado=true] - Estado
   */
  constructor({
    id,
    nombre,
    contacto,
    barrio,
    direccion,
    telefono,
    estado = true,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.contacto = contacto;
    this.barrio = barrio;
    this.direccion = direccion;
    this.telefono = telefono;
    this.estado = estado;
  }

  /**
   * Convierte a JSON para respuestas HTTP
   * @returns {Object} Datos del tercero
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      contacto: this.contacto,
      barrio: this.barrio,
      direccion: this.direccion,
      telefono: this.telefono,
      estado: this.estado,
    };
  }
}

module.exports = ThirdParties;
