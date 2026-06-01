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
 */

class ThirdParties {
  /**
   * Crea nueva instancia de ThirdParties
   * @param {Object} data - Datos del tercero
   */
  constructor(data = {}) {
    this.id = data.id || data._id;
    this.nit = data.nit;
    this.nombre_empresa = data.nombre_empresa || data.nombre;
    this.nombre_contacto = data.nombre_contacto || data.contacto;
    this.correo_empresa = data.correo_empresa;
    this.correo_contacto = data.correo_contacto;
    this.telefono = data.telefono;
    this.direccion = data.direccion;
    this.barrio = data.barrio;
    this.codigo_tercero = data.codigo_tercero;
    this.sitio_web = data.sitio_web;
    this.estado = data.estado !== undefined ? data.estado : true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Convierte a JSON para respuestas HTTP
   * @returns {Object} Datos del tercero
   */
  toJSON() {
    return {
      id: this.id,
      nit: this.nit,
      nombre_empresa: this.nombre_empresa,
      nombre_contacto: this.nombre_contacto,
      correo_empresa: this.correo_empresa,
      correo_contacto: this.correo_contacto,
      telefono: this.telefono,
      direccion: this.direccion,
      barrio: this.barrio,
      codigo_tercero: this.codigo_tercero,
      sitio_web: this.sitio_web,
      estado: this.estado,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = ThirdParties;
