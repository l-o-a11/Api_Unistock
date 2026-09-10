# Arquitectura de Unistock

## Objetivo

Este documento describe la arquitectura real del backend de Unistock, la ubicacion de los componentes principales y el flujo de uso de la API desde una peticion hasta la base de datos.

---

## Visión general

La aplicacion tiene una arquitectura por capas con separacion entre:

- transporte HTTP
- validacion y control
- logica de negocio
- acceso a datos
- persistencia y servicios externos

La base de datos principal es MongoDB con Mongoose y la capa web usa Express.

```text
Cliente / Frontend
   -> Express API
   -> Rutas
   -> Controladores
   -> Casos de uso
   -> Repositorios
   -> Modelos Mongoose
   -> MongoDB
```

---

## Capas del sistema

### 1. Capa de transporte

Archivo principal:

- src/interfaces/server.js
- src/app.js

Responsabilidad:

- levantar Express
- configurar CORS
- parsear JSON
- montar rutas
- verificar MongoDB activo
- exponer Swagger

Puntos importantes:

- La API monta rutas bajo /api
- Los origenes permitidos se validan por CORS
- Si la base de datos no esta disponible, las rutas responden con 503

### 2. Capa de rutas

Ubicacion:

- src/infrastructure/routes/

Responsabilidad:

- definir endpoints por modulo
- llamar controladores
- aplicar middleware de autenticacion y permisos

Ejemplo:

```js
router.get("/", requirePermission(MODULO, "leer"), ctrl.getRoles);
router.post("/", requirePermission(MODULO, "crear"), ctrl.createRole);
```

### 3. Capa de control

Ubicacion:

- src/infrastructure/controllers/

Responsabilidad:

- recibir req y res
- validar argumento HTTP
- delegar en casos de uso
- devolver respuestas normalizadas

Ejemplo:

- userController.js
- productionController.js
- purchaseController.js
- suppliersController.js

### 4. Capa de aplicacion

Ubicacion:

- src/application/use-cases/

Responsabilidad:

- aplicar reglas del negocio
- validar invariantes
- orquestar repositorios
- devolver entidades o DTOs

Ejemplo:

- LoginUser
- CreateUser
- UpdateUser
- DeleteUser
- ChangePassword

### 5. Capa de persistencia

Ubicacion:

- src/infrastructure/repositories/
- src/infrastructure/db/

Responsabilidad:

- encapsular acceso a MongoDB
- consultar y guardar entidades
- mantener logica de query y filtros

### 6. Capa de dominio

Ubicacion:

- src/domain/entities/

Responsabilidad:

- representar entidades del negocio
- mantener logica propia del dominio
- no depender de Express ni de Mongo

---

## Flujo de una peticion

```text
1. Cliente envia request a /api/usuarios o /api/produccion
2. Express recibe la peticion en src/interfaces/server.js
3. La ruta coincide con un router de src/infrastructure/routes
4. Se ejecutan middlewares de autenticacion / permisos
5. Controlador adapta la request
6. Caso de uso valida reglas de negocio
7. Repositorio consulta o modifica MongoDB
8. Response JSON con success/data o error
```

Ejemplo concreto: login

```text
POST /api/auth/login
  -> authRoutes.js
  -> userController.login
  -> LoginUser.execute(req.body)
  -> UserRepository verifica usuario y password
  -> genera JWT
  -> responde { success: true, data: { token, user } }
```

---

## Seguridad y autenticacion

Archivo importante:

- src/interfaces/middlewares/authMiddleware.js

Reglas actuales:

- requireAuth valida el JWT
- verifica que el usuario exista y este activo en la base de datos
- reemplaza valores del token por los datos actuales del usuario
- aplica 401 si el token no es valido o el usuario fue desactivado

Esto es importante porque evita que una sesion antigua siga funcionando cuando el rol o estado del usuario cambian.

La validacion de permisos se hace con requirePermission(modulo, accion). Se consulta el rol real de la base de datos y no solo los claims del token.

---

## Reglas de negocio principales

### Usuarios

- Los usuarios inactivos no pueden operar la API.
- No se permite dejar al unico administrador activo inhabilitado.
- Si un usuario tiene produccion activa asignada, no puede ser desactivado.
- Si se reactiva un gerente y ya existe otro gerente activo, se bloquea.

### Roles y permisos

- Los permisos se asignan por modulo.
- El backend valida permisos generando la decision desde la base de datos.
- Un usuario autenticado pero sin permisos sobre un modulo no puede usarlo.

### Proveedores

- Deben evitarse duplicados de campos clave como nit o correo.
- Las compras asociadas pueden impedir la eliminacion del proveedor.

### Compras

- La compra y su detalle se tratan como una operacion integrada.
- La anulacion exige motivo.

### Produccion

- Las ordenes tienen estados y etapas.
- La asignacion de empleados se valida con reglas internas.
- La anulacion de una orden implica dejar trazabilidad de la accion.

### Terceros

- La validacion de campos unicos y la asociacion con operaciones del negocio deben resolverse en backend antes de persistir.

---

## Estructura relevante por modulo

```text
src/
├── app.js
├── Config/
├── application/
│   └── use-cases/
├── domain/
│   └── entities/
├── infrastructure/
│   ├── controllers/
│   ├── db/
│   ├── repositories/
│   ├── routes/
│   ├── security/
│   └── cloudinary/
├── interfaces/
│   ├── middlewares/
│   └── server.js
├── shared/
├── swagger/
└── server.js
```

---

## Flujo de uso con el frontend

El frontend consulta la API con un cliente centralizado y usa la sesion del usuario para decidir que vistas puede acceder.

```text
Frontend
  -> AuthContext / session
  -> service module
  -> httpClient
  -> /api/<modulo>
  -> backend
  -> MongoDB
```

El frontend no debe decidir los permisos de forma aislada; el backend sigue siendo la fuente de verdad.

---

## TODO y seguimiento

Pendientes documentados:

- Consolidar rutas alias de /api/suppliers y /api/proveedores
- Reforzar documentacion de endpoints legacy o parcialmente migrados
- Completar pruebas por modulo y por flujo critico
- Mantener la semilla de modulos y permisos sincronizada con la UI
- Revisar y homogeneizar los nombres de los modulos entre backend y frontend

---

## Resultado esperado

Cuando una peticion llega al backend, la secuencia esperada es:

```text
Request HTTP
  -> route
  -> middleware auth
  -> middleware permission
  -> controller
  -> use case
  -> repository
  -> MongoDB
  -> response JSON
```

Esto permite una API consistente, segura y mantenible para toda la operacion del sistema.

---

## Referencias

- src/interfaces/server.js
- src/infrastructure/routes/
- src/infrastructure/controllers/
- src/interfaces/middlewares/authMiddleware.js
- src/Config/seedModulesPrivileges.js
- src/Config/database.js
  Infrastructure Layer (Repos, Controllers)
  ▲
  │ (depende de Use Cases, Entities, DB)
  │
  Interfaces Layer (Routes, Middlewares)
  ▲
  │ (depende de Controllers, Use Cases)
  │
  Express App

````

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
````

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
