// shared/constants/rolePermissions.js
// Catálogo canónico de módulos y privilegios del sistema.

const MODULES = [
  "usuarios",
  "dashboard",
  "empleados",
  "roles",
  "compras",
  "insumos",
  "categorias de insumos",
  "produccion",
  "proveedores",
  "terceros",
  "sedes",
  "productos",
  "categorias de productos",
];

const PRIVILEGES = [
  "crear",
  "leer",
  "actualizar",
  "eliminar",
];

module.exports = { MODULES, PRIVILEGES };
