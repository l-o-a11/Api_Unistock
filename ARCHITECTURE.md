# 🏗️ Arquitectura de Unistock

## Clean Architecture (Arquitectura Limpia)

Unistock implementa los principios de **Clean Architecture** de Robert Martin (Uncle Bob).

```
┌─────────────────────────────────────────────┐
│   ENTITIES (Entidades del Dominio)          │
│   - Suppliers                               │
│   - ThirdParties                            │
│   - Production                              │
└─────────────────────────────────────────────┘
              ▲
              │
┌─────────────────────────────────────────────┐
│   USE CASES (Casos de Uso / Lógica)         │
│   - CreateSupplier                          │
│   - UpdateProduction                        │
└─────────────────────────────────────────────┘
              ▲
              │
┌─────────────────────────────────────────────┐
│   REPOSITORIES (Abstracción de Datos)       │
│   - SupplierRepository                      │
│   - ProductionRepository                    │
└─────────────────────────────────────────────┘
              ▲
              │
┌─────────────────────────────────────────────┐
│   DATABASE / EXTERNAL SERVICES              │
│   - MongoDB / Mongoose                      │
│   - Store en-memoria                        │
└─────────────────────────────────────────────┘
```

### Flujo de Datos

```
HTTP Request
    │
    ▼
Route (productionRoutes.js)
    │
    ▼
Controller (productionController.js)
    │ - Valida input HTTP
    │ - Llama Use Case
    │
    ▼
Use Case (CreateProduction.js)
    │ - Lógica de negocio
    │ - Validaciones
    │
    ▼
Repository (ProductionRepository.js)
    │ - Acceso a datos
    │
    ▼
Database / Store
    │
    ▼
HTTP Response (JSON)
```

---

## 📁 Estructura por Capas

### 1. **Domain Layer** (src/domain/entities/)

Contiene la lógica del negocio pura, **sin dependencias externas**.

```javascript
// domain/entities/Suppliers.js
class Suppliers {
  constructor({ id, nit, nombre_de_empresa, ... }) { }
  toJSON() { /* Serialización */ }
}
```

**Características:**

- ✅ Sin imports externos
- ✅ Sin acceso a BD
- ✅ Reglas de negocio puro
- ✅ Testeable sin dependencias

---

### 2. **Application Layer** (src/application/use-cases/)

Contiene los **casos de uso** - las operaciones que el sistema puede realizar.

```javascript
// application/use-cases/suppliers/CreateSupplier.js
class CreateSupplier {
  constructor(supplierRepository) {}

  async execute(data) {
    // Validaciones de negocio
    // Llamar al repositorio
    // Retornar resultado
  }
}
```

**Características:**

- ✅ Encapsula lógica de un caso de uso
- ✅ Independiente de HTTP
- ✅ Reutilizable desde múltiples interfaces
- ✅ Fácil de testear

---

### 3. **Infrastructure Layer** (src/infrastructure/)

#### 3a. **Repositories** (Data Access Layer)

Abstrae la fuente de datos (BD, caché, etc).

```javascript
// infrastructure/repositories/SupplierRepository.js
class SupplierRepository {
  findAll(filters) {}
  findById(id) {}
  create(data) {}
  update(id, data) {}
  delete(id) {}
}
```

**Ventaja:** Cambiar de MongoDB a PostgreSQL solo requiere cambiar el repositorio.

#### 3b. **Database Models** (db/)

Esquemas Mongoose para MongoDB.

```javascript
// infrastructure/db/SuppliersModel.js
const suppliersSchema = new Schema({
  nit: { type: Number, unique: true },
  nombre_de_empresa: String,
  // ...
});
```

#### 3c. **Controllers** (HTTP Handlers)

Traducen HTTP requests a use cases.

```javascript
// infrastructure/controllers/suppliersController.js
const createSupplier = (req, res) => {
  const supplier = repo.create(req.body);
  return created(res, supplier);
};
```

**Responsabilidades:**

- ✅ Recibir HTTP request
- ✅ Validar input
- ✅ Llamar use case
- ✅ Retornar HTTP response

---

### 4. **Interfaces Layer** (src/interfaces/)

Define cómo el sistema expone funcionalidades.

#### Routes (server.js)

```javascript
// infrastructure/routes/suppliersRoutes.js
router.post("/", ctrl.createSupplier);
router.get("/:id", ctrl.getSupplierById);
```

#### Middlewares

```javascript
// interfaces/middlewares/authMiddleware.js
const requireAuth = (req, res, next) => {
  if (!token) return unauthorized(res);
  next();
};
```

---

## 🔄 Flujo de Ejemplo: Crear Proveedor

```
1. Cliente HTTP
   POST /proveedores
   { "nit": 123, "nombre_de_empresa": "XYZ" }

2. Route (suppliersRoutes.js)
   → router.post("/", ctrl.createSupplier)

3. Controller (suppliersController.js)
   const createSupplier = (req, res) => {
     const supplier = repo.create(req.body);
     return created(res, supplier);
   }

4. Repository (SupplierRepository.js)
   create(data) {
     const maxId = Math.max(...);
     const newSupplier = { id: maxId+1, ...data };
     suppliers.push(newSupplier);
     return this._toEntity(newSupplier);
   }

5. Database
   store._suppliers = [..., newSupplier]

6. Response
   201 Created
   { id: 1, nit: 123, nombre_de_empresa: "XYZ", ... }
```

---

## 🔌 Inversión de Control (IoC)

Los repositorios se **inyectan** en los controladores:

```javascript
// Sin IoC (acoplado)
const createSupplier = (req, res) => {
  const repo = new SupplierRepository(); // ❌ Acoplado
  repo.create(...);
};

// Con IoC (desacoplado)
const repo = new SupplierRepository();
const createSupplier = (req, res) => {
  repo.create(...); // ✅ Inyectado
};
```

**Ventaja:** Fácil de testear, cambiar implementación.

---

## 📊 Dependencias y Flujo

```
Domain Layer (Entities)
    ▲
    │ (no depende de nada)
    │
Application Layer (Use Cases)
    ▲
    │ (depende de Entities)
    │
Infrastructure Layer (Repos, Controllers)
    ▲
    │ (depende de Use Cases, Entities, DB)
    │
Interfaces Layer (Routes, Middlewares)
    ▲
    │ (depende de Controllers, Use Cases)
    │
Express App
```

**Regla de Oro:** Las capas internas NO deben depender de las capas externas.

---

## 🧪 Testabilidad

Cada capa es testeada independientemente:

```javascript
// Test de Use Case (sin BD)
describe("CreateSupplier", () => {
  it("debe validar NIT único", () => {
    const mockRepo = {
      findByNit: () => null, // Mock
      create: (data) => new Suppliers(data)
    };

    const useCase = new CreateSupplier(mockRepo);
    const result = useCase.execute({ nit: 123, ... });

    expect(result.nit).toBe(123);
  });
});
```

---

## 🔐 Ventajas de Clean Architecture

| Aspecto            | Ventaja                                         |
| ------------------ | ----------------------------------------------- |
| **Testabilidad**   | Fácil testear cada capa por separado            |
| **Mantenibilidad** | Código organizado y predecible                  |
| **Escalabilidad**  | Agregar features es sencillo                    |
| **Flexibilidad**   | Cambiar BD o framework fácilmente               |
| **Independencia**  | Lógica no acoplada a detalles técnicos          |
| **Reutilización**  | Use cases reutilizables en múltiples interfaces |

---

## 🎯 Guía de Nuevas Features

Para agregar una nueva entidad (ej: Productos):

1. **Domain Layer**

   ```javascript
   // src/domain/entities/Product.js
   class Product {}
   ```

2. **Repository**

   ```javascript
   // src/infrastructure/repositories/ProductRepository.js
   class ProductRepository {
     findAll() {}
     // ... métodos CRUD
   }
   ```

3. **Use Cases**

   ```javascript
   // src/application/use-cases/products/CreateProduct.js
   class CreateProduct {}
   ```

4. **Controller**

   ```javascript
   // src/infrastructure/controllers/productController.js
   const createProduct = (req, res) => {};
   ```

5. **Routes**

   ```javascript
   // src/infrastructure/routes/productRoutes.js
   router.post("/", ctrl.createProduct);
   ```

6. **Models** (si usas MongoDB)
   ```javascript
   // src/infrastructure/db/ProductModel.js
   const productSchema = new Schema({});
   ```

---

**Última actualización:** 26 de Abril, 2026
