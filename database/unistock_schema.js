// // Estructura principal de Unistock: colecciones, tipos, validaciones e indices.
// // Uso: mongosh "mongodb://<host>/" database/unistock_schema.js

// load("database/unistock_functions.js");

// const nullableString = { bsonType: ["string", "null"] };
// const nullableObjectId = { bsonType: ["objectId", "null"] };
// const number = { bsonType: ["double", "int", "long", "decimal"] };
// const nullableNumber = { bsonType: ["double", "int", "long", "decimal", "null"] };
// const date = { bsonType: ["date", "null"] };
// const timestamps = {
//   createdAt: { bsonType: "date" },
//   updatedAt: { bsonType: "date" },
// };

// ensureCollection("cliente", {
//   $jsonSchema: {
//     bsonType: "object",
//     required: ["nombre", "documento"],
//     properties: {
//       nombre: { bsonType: "string" }, documento: { bsonType: "string" },
//       telefono: { bsonType: "string" }, correo: { bsonType: "string" }, ...timestamps,
//     },
//   },
// });
// ensureIndex("cliente", { nombre: 1, documento: 1 });

// ensureCollection("modules", {
//   $jsonSchema: { bsonType: "object", required: ["nombre"], properties: {
//     nombre: { bsonType: "string" }, estado: { bsonType: "bool" }, ...timestamps,
//   } },
// });
// ensureIndex("modules", { nombre: 1 }, { unique: true });

// ensureCollection("privileges", {
//   $jsonSchema: { bsonType: "object", required: ["nombre"], properties: {
//     nombre: { bsonType: "string" }, estado: { bsonType: "bool" }, ...timestamps,
//   } },
// });
// ensureIndex("privileges", { nombre: 1 }, { unique: true });

// ensureCollection("roles", {
//   $jsonSchema: { bsonType: "object", required: ["nombre", "descripcion"], properties: {
//     nombre: { bsonType: "string" }, descripcion: { bsonType: "string" },
//     estado: { bsonType: "bool" }, permisos: { bsonType: "array" }, ...timestamps,
//   } },
// });
// ensureIndex("roles", { nombre: 1 }, { unique: true });

// ensureCollection("sites", {
//   $jsonSchema: { bsonType: "object", required: ["nombre", "ciudad", "barrio", "direccion", "telefono"], properties: {
//     nombre: { bsonType: "string" }, ciudad: { bsonType: "string" }, barrio: { bsonType: "string" },
//     direccion: { bsonType: "string" }, telefono: { bsonType: "string" }, estado: { bsonType: "bool" }, ...timestamps,
//   } },
// });
// ensureIndex("sites", { nombre: 1 }, { unique: true });

// ensureCollection("users", {
//   $jsonSchema: { bsonType: "object", required: ["tipoDocumento", "numeroDocumento", "nombreCompleto", "correo", "password", "rolId", "sedeId"], properties: {
//     tipoDocumento: { enum: ["CC", "TI", "CE", "PEP", "PAS", "PPT"] }, numeroDocumento: { bsonType: "string" },
//     nombreCompleto: { bsonType: "string" }, correo: { bsonType: "string" }, password: { bsonType: "string" },
//     rolId: { bsonType: "objectId" }, sedeId: { bsonType: "objectId" }, cargo: { bsonType: "array" },
//     estado: { bsonType: "bool" }, intentosFallidos: { bsonType: ["int", "long"] }, ...timestamps,
//   } },
// });
// ensureIndex("users", { numeroDocumento: 1 }, { unique: true });
// ensureIndex("users", { correo: 1 }, { unique: true });

// ensureCollection("passwordresets", {
//   $jsonSchema: { bsonType: "object", required: ["correo", "codigo", "expiraEn"], properties: {
//     correo: { bsonType: "string" }, codigo: { bsonType: "string" }, resetToken: nullableString,
//     intentos: { bsonType: ["int", "long"] }, expiraEn: { bsonType: "date" }, usado: { bsonType: "bool" },
//   } },
// });
// ensureIndex("passwordresets", { expiraEn: 1 }, { expireAfterSeconds: 0 });

// ensureCollection("productcategories", {
//   $jsonSchema: { bsonType: "object", required: ["nombre", "descripcion"], properties: {
//     nombre: { bsonType: "string" }, descripcion: { bsonType: "string" }, cantidad_productos: { bsonType: "number" },
//     productos_disponibles: { bsonType: "number" }, estado: { bsonType: "bool" }, ...timestamps,
//   } },
// });
// ensureIndex("productcategories", { nombre: 1 }, { unique: true });

// ensureCollection("products", {
//   $jsonSchema: { bsonType: "object", required: ["id_categorias", "referencia", "nombre", "precio", "stock"], properties: {
//     id_categorias: { bsonType: "objectId" }, sedeId: nullableObjectId, imagenes_Url: { bsonType: "array" },
//     referencia: { bsonType: "string" }, nombre: { bsonType: "string" }, precio: number, stock: number,
//     cliente: { bsonType: "string" }, estado: { bsonType: "bool" }, ...timestamps,
//   } },
// });
// ensureIndex("products", { referencia: 1 }, { unique: true });

// ensureCollection("supplycategories", {
//   $jsonSchema: { bsonType: "object", required: ["nombre"], properties: {
//     nombre: { bsonType: "string" }, estado: { bsonType: "bool" }, ...timestamps,
//   } },
// });
// ensureIndex("supplycategories", { nombre: 1 }, { unique: true });

// ensureCollection("supplies", {
//   $jsonSchema: { bsonType: "object", required: ["nombre", "categoria"], properties: {
//     nombre: { bsonType: "string" }, categoria: { bsonType: "objectId" }, stock: number,
//     valor_medida: nullableNumber, medida: nullableString, imagen: nullableString, imagenPublicId: nullableString,
//     estado: { bsonType: "bool" }, propiedades: { bsonType: "array", items: { bsonType: "object", required: ["clave", "label", "valor"] } }, ...timestamps,
//   } },
// });
// ensureIndex("supplies", { nombre: 1, categoria: 1 }, { unique: true });

// ensureCollection("suppliers", {
//   $jsonSchema: { bsonType: "object", required: ["nit", "nombre_de_empresa", "nombre_del_contacto", "direccion", "telefono", "correo"], properties: {
//     nit: { bsonType: "string" }, nombre_de_empresa: { bsonType: "string" }, nombre_del_contacto: { bsonType: "string" },
//     tipo_documento: nullableString, direccion: { bsonType: "string" }, telefono: number, correo: { bsonType: "string" },
//     correo_del_contacto: nullableString, telefono_contacto: nullableString, tipo_documento_contacto: nullableString,
//     sitio_web: nullableString, activo: { bsonType: "bool" }, ...timestamps,
//   } },
// });
// ensureIndex("suppliers", { nit: 1 }, { unique: true });

// ensureCollection("purchases", {
//   $jsonSchema: { bsonType: "object", required: ["fecha", "total", "numeroFactura"], properties: {
//     consecutivo: { bsonType: ["int", "long"] }, fecha: { bsonType: "date" }, proveedorId: nullableObjectId,
//     total: number, anulada: { bsonType: "bool" }, observaciones: nullableString, numeroFactura: { bsonType: "string" },
//     motivoAnulacion: nullableString, fechaAnulacion: date, ...timestamps,
//   } },
// });
// ensureIndex("purchases", { consecutivo: 1 }, { unique: true, sparse: true });
// ensureIndex("purchases", { numeroFactura: 1 }, { unique: true });

// ensureCollection("purchasedetails", {
//   $jsonSchema: { bsonType: "object", required: ["compraId", "cantidad", "precioUnitario", "subtotal"], properties: {
//     compraId: { bsonType: "objectId" }, productoId: nullableObjectId, insumoId: nullableObjectId,
//     nombre: nullableString, cantidad: number, medida: nullableString, precioUnitario: number, subtotal: number, ...timestamps,
//   } },
// });
// ensureIndex("purchasedetails", { compraId: 1 });

// // Ambos modelos ThirdParty y ThirdParties usan esta misma coleccion.
// ensureCollection("thirdparties", {
//   $jsonSchema: { bsonType: "object", required: ["nombre_empresa", "nombre_contacto", "telefono", "direccion"], properties: {
//     nit: nullableString, nombre_empresa: { bsonType: "string" }, nombre_contacto: { bsonType: "string" },
//     nombre: nullableString, contacto: nullableString, correo_empresa: nullableString, correo_contacto: nullableString,
//     telefono: { bsonType: "string" }, direccion: { bsonType: "string" }, codigo: nullableString, codigo_tercero: nullableString,
//     sitio_web: nullableString, estado: { bsonType: "bool" }, producciones: { bsonType: "array" }, ...timestamps,
//   } },
// });
// ensureIndex("thirdparties", { codigo: 1 }, { unique: true, sparse: true });
// ensureIndex("thirdparties", { codigo_tercero: 1 }, { unique: true, sparse: true });

// ensureCollection("technicalspecifications", {
//   $jsonSchema: { bsonType: "object", required: ["id_producto", "responsable", "fecha_inicio", "fecha_fin"], properties: {
//     id_producto: { bsonType: "objectId" }, responsable: { bsonType: "string" }, fecha_inicio: { bsonType: "string" },
//     fecha_fin: { bsonType: "string" }, versiones: { bsonType: ["int", "long", "double"] }, client: nullableString,
//     ref: nullableString, type: nullableString, description: nullableString, observations: nullableString,
//     createdBy: nullableString, image: {}, fabrics: { bsonType: "array" }, cups: { bsonType: "array" },
//     closures: { bsonType: "array" }, accessories: { bsonType: "array" }, measurements: { bsonType: "array" }, ...timestamps,
//   } },
// });
// ensureIndex("technicalspecifications", { id_producto: 1 });

// ensureCollection("materialtechnicalspecifications", {
//   $jsonSchema: { bsonType: "object", required: ["id_producto", "id_ficha_tecnica", "cantidades"], properties: {
//     id_producto: { bsonType: "objectId" }, id_ficha_tecnica: { bsonType: "objectId" }, id_insumo: nullableObjectId,
//     id_medida: nullableObjectId, nombre: { bsonType: "string" }, unidad: { bsonType: "string" }, cantidades: { bsonType: "string" },
//     precio_unitario: number, precio_total: number, observaciones: { bsonType: "string" }, ...timestamps,
//   } },
// });
// ensureIndex("materialtechnicalspecifications", { id_producto: 1 });
// ensureIndex("materialtechnicalspecifications", { id_ficha_tecnica: 1 });

// const orderStates = ["Diseño", "Ficha Técnica", "Corte", "Compras", "Producción", "Recepción", "Empaque", "Enviado", "Anulada"];
// ensureCollection("productionorders", {
//   $jsonSchema: { bsonType: "object", required: ["fecha_entrega", "cliente"], properties: {
//     numero_orden: { bsonType: ["int", "long", "double"] }, fecha_creacion: date, fecha_entrega: { bsonType: "date" },
//     cliente: { bsonType: "string" }, id_usuario: {}, estado: { enum: orderStates }, motivo_anulacion: nullableString,
//     tipo: { enum: ["produccion", "diseno"] }, techSpecification: {}, designImages: { bsonType: "array" },
//     finishedImages: { bsonType: "array" }, finishedImageUrl: nullableString, fromDamaged: { bsonType: "bool" },
//     originalOrderNumber: nullableString, originalOrderStatus: nullableString, producto: nullableString, referencia: nullableString,
//     empleadoAsignadoId: nullableObjectId, sedeId: nullableObjectId, etapaConfirmada: { bsonType: "bool" },
//     sedeAsignaciones: { bsonType: "array" }, terceroAsignaciones: { bsonType: "array" }, historial: { bsonType: "array" }, ...timestamps,
//   } },
// });
// ensureIndex("productionorders", { numero_orden: 1 }, { unique: true, sparse: true });
// ensureIndex("productionorders", { estado: 1, createdAt: 1 });
// ensureIndex("productionorders", { id_usuario: 1, createdAt: 1 });
// ensureIndex("productionorders", { estado: 1, fecha_entrega: 1 });
// ensureIndex("productionorders", { estado: 1, empleadoAsignadoId: 1 });

// ensureCollection("productionorderdetails", {
//   $jsonSchema: { bsonType: "object", required: ["id_orden", "id_producto", "cantidad"], properties: {
//     id_orden: { bsonType: "objectId" }, id_producto: { bsonType: "string" }, cantidad: number,
//     color: nullableString, estado: { bsonType: "bool" }, refCorte: nullableString, ...timestamps,
//   } },
// });
// ensureIndex("productionorderdetails", { id_orden: 1 });

// ensureCollection("productionstates", {
//   $jsonSchema: { bsonType: "object", required: ["nombre_estado", "orden"], properties: {
//     nombre_estado: { bsonType: "string" }, orden: number, ...timestamps,
//   } },
// });
// ensureIndex("productionstates", { nombre_estado: 1 }, { unique: true });

// ensureCollection("orderprocesses", {
//   $jsonSchema: { bsonType: "object", required: ["id_detalle", "id_estado", "id_usuario"], properties: {
//     id_detalle: { bsonType: "objectId" }, id_estado: { bsonType: "objectId" }, fecha: { bsonType: "date" }, id_usuario: { bsonType: "objectId" }, ...timestamps,
//   } },
// });
// ensureIndex("orderprocesses", { id_detalle: 1 });
// ensureIndex("orderprocesses", { id_estado: 1 });

// ensureCollection("statechanges", {
//   $jsonSchema: { bsonType: "object", required: ["id_orden", "id_estado", "id_usuario"], properties: {
//     id_orden: { bsonType: "objectId" }, id_estado: { bsonType: "objectId" }, fecha: { bsonType: "date" }, id_usuario: { bsonType: "objectId" }, ...timestamps,
//   } },
// });
// ensureIndex("statechanges", { id_orden: 1, fecha: 1 });

// ensureCollection("headquartertransfers", {
//   $jsonSchema: { bsonType: "object", required: ["id_orden", "id_sede_origen", "id_sede_destino", "cantidad"], properties: {
//     id_orden: { bsonType: "objectId" }, id_sede_origen: { bsonType: "objectId" }, id_sede_destino: { bsonType: "objectId" },
//     cantidad: number, fecha: { bsonType: "date" }, ...timestamps,
//   } },
// });
// ensureIndex("headquartertransfers", { id_orden: 1 });

// print(`\nEsquema de ${DB_NAME} instalado correctamente.`);
