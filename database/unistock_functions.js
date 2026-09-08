// // Utilidades compartidas para los scripts de Unistock.
// // Ejecutar desde mongosh con: load("database/unistock_functions.js")

// const DB_NAME = typeof UNISTOCK_DB_NAME === "string" ? UNISTOCK_DB_NAME : "Unistock";
// const database = db.getSiblingDB(DB_NAME);

// function collectionExists(name) {
//   return database.getCollectionNames().includes(name);
// }

// function ensureCollection(name, validator, validationLevel = "moderate") {
//   if (!collectionExists(name)) {
//     database.createCollection(name, { validator, validationLevel });
//     print(`Coleccion creada: ${name}`);
//     return;
//   }

//   database.runCommand({
//     collMod: name,
//     validator,
//     validationLevel,
//   });
//   print(`Validador actualizado: ${name}`);
// }

// function ensureIndex(collectionName, keys, options = {}) {
//   database.getCollection(collectionName).createIndex(keys, options);
// }

// function upsertDocument(collectionName, filter, document) {
//   database.getCollection(collectionName).updateOne(
//     filter,
//     { $setOnInsert: document },
//     { upsert: true },
//   );
// }

// function printRelationReport() {
//   const relations = [
//     ["users", "rolId", "roles"],
//     ["users", "sedeId", "sites"],
//     ["products", "id_categorias", "productcategories"],
//     ["products", "sedeId", "sites"],
//     ["supplies", "categoria", "supplycategories"],
//     ["purchases", "proveedorId", "suppliers"],
//     ["purchasedetails", "compraId", "purchases"],
//     ["purchasedetails", "productoId", "products"],
//     ["purchasedetails", "insumoId", "supplies"],
//     ["productionorderdetails", "id_orden", "productionorders"],
//     ["productionorderdetails", "id_producto", "products"],
//     ["thirdpartyassignments", "id_orden", "productionorders"],
//     ["thirdpartyassignments", "id_tercero", "thirdparties"],
//     ["technicalspecifications", "id_producto", "products"],
//     ["materialtechnicalspecifications", "id_producto", "products"],
//     ["materialtechnicalspecifications", "id_ficha_tecnica", "technicalspecifications"],
//     ["orderprocesses", "id_detalle", "productionorderdetails"],
//     ["orderprocesses", "id_estado", "productionstates"],
//     ["orderprocesses", "id_usuario", "users"],
//     ["statechanges", "id_orden", "productionorders"],
//     ["statechanges", "id_estado", "productionstates"],
//     ["statechanges", "id_usuario", "users"],
//     ["headquartertransfers", "id_orden", "productionorders"],
//     ["headquartertransfers", "id_sede_origen", "sites"],
//     ["headquartertransfers", "id_sede_destino", "sites"],
//   ];

//   print("\nRelaciones documentadas (MongoDB no aplica FK automaticamente):");
//   relations.forEach(([source, field, target]) => print(`- ${source}.${field} -> ${target}._id`));
// }
