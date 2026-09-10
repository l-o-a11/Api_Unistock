# Base de datos de Unistock

Los scripts estan separados para que la estructura principal no se mezcle con los datos iniciales ni con las funciones auxiliares.

## Ejecucion

Desde la raiz del repositorio:

```bash
mongosh "mongodb://<host>/" database/unistock_schema.js
mongosh "mongodb://<host>/" database/unistock_data.js
```

Si la base no se llama `Unistock`, usar una variable antes de ejecutar el script:

```javascript
UNISTOCK_DB_NAME = "unistock";
load("database/unistock_schema.js");
load("database/unistock_data.js");
```

El esquema es idempotente: crea colecciones nuevas y aplica `collMod` a las existentes sin eliminar datos. La validacion usa nivel `moderate` para permitir mantenimiento de datos antiguos sin bloquear actualizaciones no relacionadas.

## Relaciones

MongoDB no implementa llaves foraneas. Las relaciones estan documentadas en `unistock_functions.js` y se representan con `ObjectId`:

- `users.rolId` -> `roles._id`; `users.sedeId` -> `sites._id`
- `products.id_categorias` -> `productcategories._id`; `products.sedeId` -> `sites._id`
- `supplies.categoria` -> `supplycategories._id`
- `purchases.proveedorId` -> `suppliers._id`
- `purchasedetails.compraId` -> `purchases._id`; `productoId` -> `products._id`; `insumoId` -> `supplies._id`
- `productionorderdetails.id_orden` -> `productionorders._id`
- `thirdpartyassignments.id_orden` -> `productionorders._id`; `id_tercero` -> `thirdparties._id`
- `technicalspecifications.id_producto` -> `products._id`
- `materialtechnicalspecifications.id_producto` -> `products._id`; `id_ficha_tecnica` -> `technicalspecifications._id`
- `orderprocesses.id_detalle` -> `productionorderdetails._id`; `id_estado` -> `productionstates._id`; `id_usuario` -> `users._id`
- `statechanges.id_orden` -> `productionorders._id`; `id_estado` -> `productionstates._id`; `id_usuario` -> `users._id`
- `headquartertransfers.id_orden` -> `productionorders._id`; `id_sede_origen`/`id_sede_destino` -> `sites._id`

## Funciones y reglas que siguen en el backend

MongoDB no ejecuta automaticamente los hooks de Mongoose. Estas reglas siguen estando en los modelos de la aplicacion:

- Autoincremento de `productionorders.numero_orden` y `purchases.consecutivo`.
- Normalizacion y validacion del historial de estados de una orden.
- Conversion de `productionorderdetails.id_orden` desde texto a `ObjectId`.
- Defaults, `trim`, `lowercase`, `min`, `enum` y metodos `toJSON` de Mongoose.
- Validacion de que un detalle de compra tenga producto o insumo.

## Observaciones importantes

- `ThirdPartyModel` y `ThirdPartiesModel` escriben en `thirdparties` con contratos parcialmente diferentes; el validador admite ambos formatos. Conviene consolidarlos en un solo modelo antes de endurecer `required`.
- Algunos modelos usan refs Mongoose `Sede` y `Headquarters`, aunque los modelos registrados actualmente son `site` y no existe `Headquarters`. El script relaciona ambos campos con la coleccion real `sites`; debe corregirse el `ref` en el backend si se usa `populate`.
- `clients` y `technicalsheets` no se crean porque no tienen modelo activo. Son colecciones legadas del script anterior.
- `Empaque` se conserva como estado legado; las nuevas transiciones usan `Recepción`.
- El script no incluye contrasenas ni usuarios administrativos reales. Deben crearse por el flujo de autenticacion o con un script seguro separado.
