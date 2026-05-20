// shared/constants/rolePermissions.js
// Catálogo de módulos y privilegios que usan los roles.

const MODULES = [
  "usuarios",
  "ventas",
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

module.exports = {
  MODULES,
  PRIVILEGES,
};
