// shared/constants/rolPermissions.js
// Catálogo de módulos y privilegios que usan los roles.

const MODULOS = [
  "usuarios",
  "ventas",
  "empleados",
  "roles",
  "compras",
  "insumos",
  "categorias-insumos",
  "produccion",
  "proveedores",
  "terceros",
  "sedes",
  "productos",
  "categorias-productos",
];

const PRIVILEGIOS = [
  "crear",
  "leer",
  "actualizar",
  "eliminar",
];

module.exports = {
  MODULOS,
  PRIVILEGIOS,
};
