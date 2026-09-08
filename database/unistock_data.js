// // Datos base y comprobacion de relaciones de Unistock.
// // Ejecutar despues de unistock_schema.js:
// // mongosh "mongodb://<host>/" database/unistock_data.js

// load("database/unistock_functions.js");

// const now = new Date();
// const estados = [
//   "Diseño", "Ficha Técnica", "Corte", "Compras", "Producción", "Recepción", "Enviado", "Anulada",
// ];

// estados.forEach((nombre_estado, orden) => {
//   upsertDocument("productionstates", { nombre_estado }, {
//     nombre_estado,
//     orden: orden + 1,
//     createdAt: now,
//     updatedAt: now,
//   });
// });

// const modulos = [
//   "usuarios", "roles", "productos", "insumos", "compras", "produccion", "sedes", "proveedores", "terceros",
// ];
// modulos.forEach((nombre) => upsertDocument("modules", { nombre }, {
//   nombre,
//   estado: true,
//   createdAt: now,
//   updatedAt: now,
// }));

// const privilegios = ["crear", "leer", "actualizar", "eliminar"];
// privilegios.forEach((nombre) => upsertDocument("privileges", { nombre }, {
//   nombre,
//   estado: true,
//   createdAt: now,
//   updatedAt: now,
// }));

// print("Datos base cargados sin duplicar registros existentes.");
// printRelationReport();
