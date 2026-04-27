## 📖 Documentación de Controladores

### suppliersController.js

Controlador que maneja todas las operaciones HTTP relacionadas con **Proveedores**.

#### Métodos

- **getSuppliers(req, res)** - GET /proveedores
  - Obtiene lista de proveedores con filtros opcionales
  - Filtros: `search`, `activo`
  - Respuesta: Array de proveedores

- **getSupplierById(req, res)** - GET /proveedores/:id
  - Obtiene un proveedor específico
  - Parámetros: `id`
  - Respuesta: Objeto proveedor

- **createSupplier(req, res)** - POST /proveedores
  - Crea un nuevo proveedor
  - Validaciones: NIT y correo únicos, campos requeridos
  - Respuesta: Proveedor creado (201)

- **updateSupplier(req, res)** - PUT /proveedores/:id
  - Actualiza datos del proveedor
  - Parámetros: `id`
  - Respuesta: Proveedor actualizado

- **deleteSupplier(req, res)** - DELETE /proveedores/:id
  - Elimina un proveedor
  - Parámetros: `id`
  - Respuesta: Mensaje de confirmación

---

### thirdPartiesController.js

Controlador para operaciones con **Terceros** (contratistas externos).

#### Métodos

- **getThirdParties(req, res)** - GET /terceros
  - Obtiene lista de terceros con filtros
  - Filtros: `search`, `estado`

- **getThirdPartyById(req, res)** - GET /terceros/:id
  - Obtiene tercero específico

- **createThirdParty(req, res)** - POST /terceros
  - Crea nuevo tercero
  - Campos requeridos: nombre, contacto, direccion, telefono

- **updateThirdParty(req, res)** - PUT /terceros/:id
  - Actualiza tercero existente

- **deleteThirdParty(req, res)** - DELETE /terceros/:id
  - Elimina tercero

---

### productionController.js

Controlador para **Órdenes de Producción**, Detalles y Asignaciones.

#### Métodos - Órdenes

- **getOrders(req, res)** - GET /produccion/ordenes
  - Lista todas las órdenes de producción
  - Filtros: `search`, `id_usuario`

- **getOrderById(req, res)** - GET /produccion/ordenes/:id
  - Obtiene orden con sus detalles incluidos
  - Respuesta: Orden + array de detalles

- **createOrder(req, res)** - POST /produccion/ordenes
  - Crea nueva orden
  - Campos requeridos: fecha_entrega, cliente, id_usuario

- **updateOrder(req, res)** - PUT /produccion/ordenes/:id
  - Actualiza orden existente

- **deleteOrder(req, res)** - DELETE /produccion/ordenes/:id
  - Elimina orden

#### Métodos - Detalles

- **getOrderDetails(req, res)** - GET /produccion/detalle-orden
  - Lista detalles de órdenes
  - Filtro opcional: `id_orden`

- **createOrderDetail(req, res)** - POST /produccion/detalle-orden
  - Agrega detalle a una orden
  - Campos requeridos: id_orden, id_producto, cantidad

#### Métodos - Asignaciones

- **getAssignments(req, res)** - GET /produccion/asignaciones
  - Lista asignaciones de terceros
  - Filtros: `id_orden`, `id_tercero`

- **createAssignment(req, res)** - POST /produccion/asignaciones
  - Asigna tercero a una orden
  - Campos requeridos: id_orden, id_tercero, cantidad

---

## 🏛️ Documentación de Repositorios

### SupplierRepository.js

Abstrae el acceso a datos para **Proveedores**.

#### Métodos Públicos

- **findAll(filters)** → Array<Suppliers>
  - Obtiene todos los proveedores
  - Soporta filtros: search, activo

- **findById(id)** → Suppliers|null
  - Busca proveedor por ID

- **findByEmail(correo)** → Suppliers|null
  - Busca proveedor por correo (validación de unicidad)

- **findByNit(nit)** → Suppliers|null
  - Busca proveedor por NIT (validación de unicidad)

- **create(data)** → Suppliers
  - Crea nuevo proveedor
  - Retorna entidad Suppliers

- **update(id, data)** → Suppliers|null
  - Actualiza proveedor existente

- **delete(id)** → boolean
  - Elimina proveedor
  - Retorna true si fue exitoso

---

### ThirdPartiesRepository.js

Abstrae el acceso a datos para **Terceros**.

#### Métodos Públicos

- **findAll(filters)** → Array<ThirdParties>
  - Filtros: search, estado

- **findById(id)** → ThirdParties|null

- **create(data)** → ThirdParties

- **update(id, data)** → ThirdParties|null

- **delete(id)** → boolean

---

### ProductionRepository.js

Abstrae el acceso a datos para **Órdenes de Producción**.

#### Métodos Públicos

- **findAll(filters)** → Array<Production>
  - Filtros: search, id_usuario

- **findById(id)** → Production|null

- **create(data)** → Production
  - Establece automáticamente fecha_creacion

- **update(id, data)** → Production|null

- **delete(id)** → boolean

---

### ProductionOrderDetailRepository.js

Abstrae el acceso a datos para **Detalles de Órdenes**.

#### Métodos Públicos

- **findAll(filters)** → Array<ProductionOrderDetail>
  - Filtro: id_orden

- **findById(id)** → ProductionOrderDetail|null

- **create(data)** → ProductionOrderDetail

- **update(id, data)** → ProductionOrderDetail|null

- **delete(id)** → boolean

---

### ThirdPartyAssignmentRepository.js

Abstrae el acceso a datos para **Asignaciones de Terceros**.

#### Métodos Públicos

- **findAll(filters)** → Array<ThirdPartyAssignment>
  - Filtros: id_orden, id_tercero

- **findById(id)** → ThirdPartyAssignment|null

- **create(data)** → ThirdPartyAssignment
  - Establece automáticamente fecha

- **update(id, data)** → ThirdPartyAssignment|null

- **delete(id)** → boolean

---

## 🎯 Patrones de Uso

### Pattern: Controller → Repository → Entity

```javascript
// 1. Controlador recibe request
const createSupplier = (req, res) => {
  // 2. Valida y delega al repositorio
  const supplier = repo.create(req.body);

  // 3. Retorna respuesta HTTP
  return created(res, supplier);
};

// Repository usa la entidad
create(data) {
  const newSupplier = new Suppliers(data); // Entidad
  store.push(newSupplier);
  return this._toEntity(newSupplier); // Retorna entidad
}
```

### Pattern: Error Handling

```javascript
try {
  const result = repository.findById(id);
  if (!result) return notFound(res, "No encontrado");
  return ok(res, result);
} catch (err) {
  return serverError(res);
}
```

---

## 🔍 Validaciones Comunes

### Proveedores

- ✅ NIT único
- ✅ Correo único
- ✅ Campos requeridos
- ✅ Teléfono es número

### Terceros

- ✅ Nombre, contacto, dirección requeridos
- ✅ Teléfono como string

### Órdenes

- ✅ Fecha entrega requerida
- ✅ Cliente requerido
- ✅ Usuario debe existir

### Detalles

- ✅ Orden debe existir
- ✅ Producto debe existir
- ✅ Cantidad > 0

---

**Última actualización:** 26 de Abril, 2026
