/**
 * Suppliers.js
 * 
 * Entidad de Dominio para Proveedores.
 * Representa un proveedor de la empresa con toda su información.
 * 
 * Esta es una clase pura del dominio — no tiene dependencias externas
 * ni acceso a bases de datos. Solo define la estructura y validaciones
 * específicas del dominio de "Proveedores".
 * 
 * @class Suppliers
 * @author Unistock Team
 * @version 1.0.0
 * 
 * @property {number} id - ID único del proveedor
 * @property {number} nit - NIT del proveedor (único)
 * @property {string} nombre_de_empresa - Nombre de la empresa proveedora
 * @property {string} nombre_del_contacto - Nombre del contacto principal
 * @property {string} direccion - Dirección física
 * @property {number} telefono - Teléfono de contacto
 * @property {string} correo - Email de contacto (único)
 * @property {string} sitio_web - Sitio web del proveedor
 * @property {boolean} activo - Estado del proveedor (activo/inactivo)
 */

class Suppliers {
  /**
   * Crea una nueva instancia de Suppliers
   * @param {Object} data - Datos del proveedor
   * @param {number} data.id - ID único
   * @param {number} data.nit - NIT
   * @param {string} data.nombre_de_empresa - Nombre empresa
   * @param {string} data.nombre_del_contacto - Contacto
   * @param {string} data.direccion - Dirección
   * @param {number} data.telefono - Teléfono
   * @param {string} data.correo - Email
   * @param {string} data.sitio_web - Sitio web
   * @param {boolean} [data.activo=true] - Estado activo
   */
  constructor({
    id,
    nit,
    nombre_de_empresa,
    nombre_del_contacto,
    direccion,
    telefono,
    correo,
    sitio_web,
    activo = true,
  }) {
    this.id = id;
    this.nit = nit;
    this.nombre_de_empresa = nombre_de_empresa;
    this.nombre_del_contacto = nombre_del_contacto;
    this.direccion = direccion;
    this.telefono = telefono;
    this.correo = correo;
    this.sitio_web = sitio_web;
    this.activo = activo;
  }

  /**
   * Convierte la entidad a JSON para respuestas HTTP
   * @returns {Object} Objeto plano con los datos del proveedor
   */
  toJSON() {
    return {
      id: this.id,
      nit: this.nit,
      nombre_de_empresa: this.nombre_de_empresa,
      nombre_del_contacto: this.nombre_del_contacto,
      direccion: this.direccion,
      telefono: this.telefono,
      correo: this.correo,
      sitio_web: this.sitio_web,
      activo: this.activo,
    };
  }
}

module.exports = Suppliers;
