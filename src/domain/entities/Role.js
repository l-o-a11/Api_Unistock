/**
 * Role.js
 * 
 * Entidad de Dominio para Roles.
 * Representa un rol registrado en el sistema.
 * 
 * Entidad pura del dominio sin dependencias externas.
 * 
 * @class Products
 * @author Unistock Team
 * 
 * @property {number} id - ID único del rol
 * @property {string} nombre - nombre del rol
 * @property {string} descripcion - describe las funciones del rol
 * @property {boolean} estado - Estado del rol
 * @property {string} permisos - [] permisos del rol con modulos y privilegios
 */
class Role {
/**
   * Crea nueva instancia de Products
   * @param {Object} data - Datos del producto
   * @param {number} data.id - ID único
   * @param {string} data.nombre - nombre del rol
   * @param {string} data.descripcion - describe las funciones del rol
   * @param {boolean} data.estado - Estado del producto
   * @param {string} data.permisos - [] permisos del rol con modulos y privilegios
   */
  constructor({
    id,
    nombre,
    descripcion,
    estado = true,
    permisos = [],
  }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.estado = estado;
    this.permisos = permisos;
  }

  /**
   * Convierte la entidad a JSON para respuestas HTTP
   * @returns {Object} Objeto plano con los datos del rol
   */

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      estado: this.estado,
      permisos: this.permisos,
    };
  }
}



module.exports = Role;