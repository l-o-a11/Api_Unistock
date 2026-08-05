# 📖 Documentación de la API Unistock (Api_Unistock)

> **Backend principal de Unistock** — servidor Express + MongoDB (puerto `3000`).

Esta documentación cubre **todos** los componentes del backend: arquitectura, arranque, endpoints por módulo, controladores, casos de uso, repositorios, modelos de base de datos, entidades de dominio, middlewares y utilidades compartidas.

---

## 📑 Tabla de contenidos

1. [Visión general](#-visión-general)
2. [Arquitectura](#-arquitectura)
3. [Configuración y arranque](#-configuración-y-arranque)
4. [Convenciones de respuesta](#-convenciones-de-respuesta)
5. [Autenticación](#-autenticación)
6. [Endpoints por módulo](#-endpoints-por-módulo)
   - [Autenticación](#-autenticación-auth)
   - [Usuarios](#-usuarios-users)
   - [Proveedores](#-proveedores-suppliers)
   - [Terceros](#-terceros-thirdparties)
   - [Productos](#-productos-products)
   - [Categorías de productos](#-categorías-de-productos-product-categories)
   - [Producción](#-producción-production)
   - [Compras](#-compras-purchases)
   - [Insumos](#-insumos-supplies)
   - [Categorías de insumos](#-categorías-de-insumos-supply-categories)
   - [Roles](#-roles)
   - [Sedes](#-sedes-sites)
   - [Módulos y privilegios](#-módulos-y-privilegios)
   - [Clientes](#-clientes-clients)
   - [Subida de archivos](#-subida-de-archivos-upload)
   - [Documentación Swagger](#-swagger)
7. [Controladores](#-controladores)
8. [Casos de uso (Use Cases)](#-casos-de-uso-use-cases)
9. [Repositorios](#-repositorios)
10. [Modelos de base de datos](#-modelos-de-base-de-datos)
11. [Entidades de dominio](#-entidades-de-dominio)
12. [Middlewares y seguridad](#-middlewares-y-seguridad)
13. [Utilidades y servicios compartidos](#-utilidades-y-servicios-compartidos)

---

## 🚀 Visión general

Unistock es un sistema de gestión para una empresa de confección de ropa femenina. El backend expone una **API REST** construida con **Node.js + Express + MongoDB (Mongoose)**.

**Stack:**

- **Framework:** Express
- **Base de datos:** MongoDB (Atlas) vía Mongoose
- **Validación:** Zod (`shared/schemas`)
- **Autenticación:** JWT (`infrastructure/security/token_generator.js`)
- **Subida de imágenes:** Cloudinary (multer + cloudinary.v2)
- **Envío de correos:** Nodemailer (`shared/utils/emailService.js`)
- **Documentación API:** Swagger (`swagger/swagger.js`)

**Puerto por defecto:** `3000` (`PORT` en `.env`)

---

## 🏛️ Arquitectura

El backend sigue los principios de **Clean Architecture** (Arquitectura Limpia), separando responsabilidades en capas:

```
┌─────────────────────────────────────────────┐
│   ENTITIES (domain/entities/)               │
│   - Suppliers, ThirdParties, Production,    │
│   - Products, Purchase, User, Role, ...     │
└─────────────────────────────────────────────┘
              ▲
              │
┌─────────────────────────────────────────────┐
│   USE CASES (application/use-cases/)        │
│   - CreateSupplier, LoginUser, CreateOrder, │
│   - CambiarEstadoProduction, ...            │
└─────────────────────────────────────────────┘
              ▲
              │
┌─────────────────────────────────────────────┐
│   REPOSITORIES (infrastructure/repositories/)│
│   - SupplierRepository, ProductRepository    │
└─────────────────────────────────────────────┘
              ▲
              │
┌─────────────────────────────────────────────┐
│   CONTROLLERS (infrastructure/controllers/) │
│   - suppliersController, productController   │
└─────────────────────────────────────────────┘
              ▲
              │
┌─────────────────────────────────────────────┐
│   ROUTES (infrastructure/routes/)           │
│   - suppliersRoutes, productRoutes, ...     │
└─────────────────────────────────────────────┘
              ▲
              │
┌─────────────────────────────────────────────┐
│   EXPRESS APP (interfaces/server.js)        │
└─────────────────────────────────────────────┘
```

### Flujo de una petición

```
HTTP Request
    │
    ▼
Route (infrastructure/routes/*)
    │ → Middlewares (auth, validación)
    ▼
Controller (infrastructure/controllers/*)
    │ → Mapea HTTP → datos, valida, llama use case/repo
    ▼
Use Case (application/use-cases/*)  [opcional]
    │ → Lógica de negocio
    ▼
Repository (infrastructure/repositories/*)
    │ → Acceso a datos
    ▼
MongoDB (Modelos Mongoose)
    │
    ▼
HTTP Response (JSON)  { success, data | message }
```

### Estructura de carpetas

```
Api_Unistock/
├── src/
│   ├── application/
│   │   └── use-cases/          # Casos de uso (lógica de negocio)
│   │       ├── auth/
│   │       ├── productCategories/
│   │       ├── production/
│   │       ├── products/
│   │       ├── purchases/
│   │       ├── roles/
│   │       ├── sites/
│   │       ├── suppliers/
│   │       ├── supplies/
│   │       ├── supplyCategories/
│   │       ├── thirdParties/
│   │       └── users/
│   ├── Config/
│   │   ├── database.js             # Conexión MongoDB + store en memoria
│   │   └── seedModulesPrivileges.js
│   ├── domain/
│   │   └── entities/               # Entidades puras del dominio
│   ├── infrastructure/
│   │   ├── cloudinary/             # Config, servicio y middleware de Cloudinary
│   │   ├── controllers/            # Controladores HTTP
│   │   ├── db/                     # Modelos Mongoose
│   │   ├── middlewares/            # validateSchema, upload
│   │   ├── repositories/           # Repositorios (acceso a datos)
│   │   ├── routes/                 # Definición de rutas
│   │   └── security/               # password_encrypter, token_generator
│   ├── interfaces/
│   │   ├── server.js               # Configuración de la app Express
│   │   └── middlewares/            # authMiddleware, validationMiddleware
│   ├── shared/
│   │   ├── constants/              # rolePermissions
│   │   ├── schemas/                # Esquemas Zod (production, thirdParty)
│   │   ├── services/               # BackendService
│   │   └── utils/                  # response, email, cloudinary, etc.
│   └── swagger/                    # Configuración Swagger
├── app.js                          # Punto de entrada (conecta DB y arranca)
└── src/server.js
```

---

## ⚙️ Configuración y arranque

### Variables de entorno (`.env`)

```env
PORT=3000
MONGO_URI=mongodb+srv://...
DATABASE_NAME=unistock
FRONTEND_URL=http://localhost:5173
JWT_SECRET=tu_secreto_seguro
JWT_EXPIRES_IN=7d
BACKEND_URL=http://localhost:3001
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_SERVICE=gmail
EMAIL_USER=...
EMAIL_PASS=...
```

### Punto de entrada (`app.js`)

1. Carga `dotenv`.
2. Conecta a MongoDB vía `connectDatabase()`.
3. Ejecuta el seeder de módulos y privilegios (`seedModulesAndPrivileges`).
4. Arranca el servidor en `PORT` (default `3000`).

```bash
npm start            # Inicia el servidor
npm run dev          # Modo desarrollo (si está configurado)
```

### Middleware global (fail-fast)

En `interfaces/server.js`, si MongoDB no está conectado, **todas** las rutas responden `503` ("MongoDB no está disponible") en lugar de entrar en modo buffering de Mongoose.

### CORS

Orígenes permitidos: `FRONTEND_URL` (default `http://localhost:5173`), `http://localhost:5000` (Flutter Web), emulador Android y `MOBILE_ORIGINS`.

---

## ✅ Convenciones de respuesta

Todas las respuestas usan la forma `{ success, data }` o `{ success, message }`:

| Código | Helper                          | Formato                                |
| ------ | ------------------------------- | -------------------------------------- |
| 200    | `ok(res, data)`                 | `{ success: true, data }`              |
| 201    | `created(res, data)`            | `{ success: true, data }`              |
| 204    | `noContent(res)`                | sin body                               |
| 400    | `badRequest(res, msg, errors?)` | `{ success: false, message, errors? }` |
| 401    | `unauthorized(res, msg)`        | `{ success: false, message }`          |
| 403    | `forbidden(res, msg)`           | `{ success: false, message }`          |
| 404    | `notFound(res, msg)`            | `{ success: false, message }`          |
| 409    | `conflict(res, msg)`            | `{ success: false, message }`          |
| 422    | `unprocessable(res, msg)`       | `{ success: false, message }`          |
| 500    | `serverError(res, msg)`         | `{ success: false, message }`          |

---

## 🔐 Autenticación

El sistema usa **JWT (Bearer token)**.

- **Login:** `POST /api/auth/login` → devuelve `{ token, user }`.
- El frontend guarda el token en `sessionStorage`/`localStorage` y lo envía en el header `Authorization: Bearer <token>`.
- **Middleware `requireAuth`:** valida firma del token **y** verifica en BD que el usuario siga activo (no depende solo de los claims del JWT). Refresca `rolNombre`, `rolId`, `sedeId` con los valores actuales.
- **Middleware `requireRole(...roles)`:** restringe a roles específicos (ej. `Gerente`, `Administrador`).

> **Nota:** muchos endpoints de productos/producción tienen `requireAuth` **comentado** para desarrollo público. En producción se debe reactivar.

---

## 📡 Endpoints por módulo

Todas las rutas están montadas bajo el prefijo `/api` (ver `interfaces/server.js`).

---

### 🔐 Autenticación (`/api/auth`) — `authRoutes.js`

| Método | Ruta                    | Descripción                         | Auth    | Body/Query                                    |
| ------ | ----------------------- | ----------------------------------- | ------- | --------------------------------------------- |
| POST   | `/auth/login`           | Iniciar sesión                      | Público | `{ correo, password }`                        |
| POST   | `/auth/prepare-welcome` | Genera contraseña temporal          | Público | `{ email }`                                   |
| POST   | `/auth/forgot-password` | Solicitar código de recuperación    | Público | `{ correo }`                                  |
| POST   | `/auth/verify-code`     | Verificar código de recuperación    | Público | `{ correo, codigo }`                          |
| POST   | `/auth/reset-password`  | Restablecer contraseña              | Público | `{ resetToken, password, confirmarPassword }` |
| PUT    | `/auth/change-password` | Cambiar contraseña (autenticado)    | 🔒      | `{ newPassword }`                             |
| PUT    | `/auth/profile`         | Actualizar perfil propio            | 🔒      | `{ nombreCompleto?, correo? }`                |
| POST   | `/auth/verify-password` | Verifica contraseña del autenticado | 🔒      | `{ password }`                                |

**Controlador:** `userController.js`
**Casos de uso:** `LoginUser`, `ForgotPassword`, `VerifyCode`, `ResetPassword`, `ChangePassword`

---

### 👤 Usuarios (`/api/users`) — `userRoutes.js`

| Método | Ruta                | Descripción        | Roles          | Body/Query                  |
| ------ | ------------------- | ------------------ | -------------- | --------------------------- |
| GET    | `/users`            | Listar usuarios    | Gerente, Admin | `?search&estado&page&limit` |
| GET    | `/users/:id`        | Obtener usuario    | Gerente, Admin | —                           |
| POST   | `/users`            | Crear usuario      | Gerente, Admin | ver campos                  |
| PUT    | `/users/:id`        | Actualizar usuario | Gerente, Admin | campos parciales            |
| PATCH  | `/users/:id/status` | Activar/desactivar | Gerente, Admin | —                           |
| DELETE | `/users/:id`        | Eliminar usuario   | Gerente, Admin | —                           |

**Controlador:** `userController.js`
**Casos de uso:** `CreateUser`, `GetUser`, `GetUserById`, `UpdateUser`, `DeleteUser`

---

### 🏭 Proveedores (`/api/suppliers` y `/api/proveedores`) — `suppliersRoutes.js`

> El frontend usa el alias `/proveedores`.

| Método | Ruta                           | Descripción               | Auth | Body/Query                                                                                       |
| ------ | ------------------------------ | ------------------------- | ---- | ------------------------------------------------------------------------------------------------ |
| GET    | `/suppliers`                   | Listar proveedores        | —    | `?search&activo`                                                                                 |
| GET    | `/suppliers/:id/has-purchases` | ¿Tiene compras asociadas? | —    | —                                                                                                |
| GET    | `/suppliers/:id`               | Obtener proveedor         | —    | —                                                                                                |
| POST   | `/suppliers`                   | Crear proveedor           | —    | `{ nit, nombreEmpresa, nombreContacto, tipoDocumento, direccion, telefono, correoEmpresa, ... }` |
| PUT    | `/suppliers/:id`               | Actualizar proveedor      | —    | campos parciales                                                                                 |
| DELETE | `/suppliers/:id`               | Eliminar proveedor        | —    | —                                                                                                |
| PATCH  | `/suppliers/:id/toggle`        | Activar/inactivar         | —    | —                                                                                                |

**Validaciones:** NIT único (normalizado sin guiones), correo único, campos requeridos. No se puede editar el NIT si el proveedor ya tiene compras.

**Controlador:** `suppliersController.js`
**Repositorio:** `SupplierRepository.js`
**Caso de uso:** `CreateSupplier`, `UpdateSupplier`, `GetSupplier`, `GetSupplierById`, `DeleteSupplier`

---

### 🧑🤝🧑 Terceros (`/api/terceros`) — `thirdPartiesRoute.js`

| Método | Ruta                         | Descripción                    | Auth | Body/Query                                                                                   |
| ------ | ---------------------------- | ------------------------------ | ---- | -------------------------------------------------------------------------------------------- |
| GET    | `/terceros`                  | Listar terceros                | 🔒   | `?search&estado&limit=100`                                                                   |
| GET    | `/terceros/:id`              | Obtener tercero                | 🔒   | —                                                                                            |
| POST   | `/terceros`                  | Crear tercero                  | 🔒   | `{ nit, nombre, contacto, direccion, telefono, correo_empresa, correo_contacto, sitio_web }` |
| PUT    | `/terceros/:id`              | Actualizar tercero             | 🔒   | campos parciales                                                                             |
| DELETE | `/terceros/:id`              | Eliminar tercero               | 🔒   | —                                                                                            |
| PATCH  | `/terceros/:id/toggle`       | Activar/inactivar              | 🔒   | —                                                                                            |
| POST   | `/terceros/:id/producciones` | Vincular producción al tercero | 🔒   | `{ orden, fecha, produccionId, cantidad }`                                                   |

**Validación:** esquema Zod (`shared/schemas/thirdPartySchema.js`).

**Controlador:** `thirdPartiesController.js`
**Repositorio:** `ThirdPartiesRepository.js`
**Caso de uso:** `CreateThirdParty`, `UpdateThirdParties`, `GetThirdParties`, `GetThirdPartiesById`, `DeleteThirdParties`, `LinkProduccion`

---

### 📦 Productos (`/api/products`) — `productRoutes.js`

| Método | Ruta                   | Descripción                                 | Auth | Body/Query                                                            |
| ------ | ---------------------- | ------------------------------------------- | ---- | --------------------------------------------------------------------- |
| GET    | `/products`            | Listar productos                            | —    | `?search&categoria&estado`                                            |
| GET    | `/products/:id`        | Obtener producto (por id o referencia)      | —    | —                                                                     |
| POST   | `/products`            | Crear producto + ficha técnica + materiales | —    | `{ id_categorias, referencia, nombre, precio, stock, ficha_tecnica }` |
| PUT    | `/products/:id`        | Actualizar producto                         | —    | campos parciales                                                      |
| DELETE | `/products/:id`        | Eliminar producto                           | —    | —                                                                     |
| PATCH  | `/products/:id/status` | Cambiar estado del producto                 | —    | —                                                                     |

#### Fichas técnicas (anidadas en `/products/:id/tecnicas`)

| Método | Ruta                                 | Descripción                           |
| ------ | ------------------------------------ | ------------------------------------- |
| GET    | `/products/:id/tecnicas`             | Listar fichas técnicas de un producto |
| GET    | `/products/:id/tecnicas/:techSpecId` | Obtener ficha técnica                 |
| POST   | `/products/:id/tecnicas`             | Crear ficha técnica                   |
| PUT    | `/products/:id/tecnicas/:techSpecId` | Actualizar ficha técnica              |
| DELETE | `/products/:id/tecnicas/:techSpecId` | Eliminar ficha técnica                |

#### Materiales de ficha técnica

| Método | Ruta                                                                | Descripción         |
| ------ | ------------------------------------------------------------------- | ------------------- |
| GET    | `/products/:id/tecnicas/:techSpecId/materiales`                     | Listar materiales   |
| GET    | `/products/:id/tecnicas/:techSpecId/materiales/:materialTechSpecId` | Obtener material    |
| POST   | `/products/:id/tecnicas/:techSpecId/materiales`                     | Crear material      |
| PUT    | `/products/:id/tecnicas/:techSpecId/materiales/:materialTechSpecId` | Actualizar material |
| DELETE | `/products/:id/tecnicas/:techSpecId/materiales/:materialTechSpecId` | Eliminar material   |

> Rutas de compatibilidad con prefijo antiguo `/products/:id/materiales`.

**Controlador:** `productController.js`
**Repositorios:** `ProductRepository`, `TechnicalSpecificationsRepository`, `MaterialTechnicalSpecificationsRepository`
**Casos de uso:** `CreateProduct`, `UpdateProduct`, `GetProduct`, `GetProductById`, `DeleteProduct`

---

### 🗂️ Categorías de productos (`/api/product-categories` y `/api/products-categories`) — `productCategoryRoutes.js`

| Método | Ruta                      | Descripción          | Auth |
| ------ | ------------------------- | -------------------- | ---- |
| GET    | `/product-categories`     | Listar categorías    | —    |
| GET    | `/product-categories/:id` | Obtener categoría    | —    |
| POST   | `/product-categories`     | Crear categoría      | —    |
| PUT    | `/product-categories/:id` | Actualizar categoría | —    |
| DELETE | `/product-categories/:id` | Eliminar categoría   | —    |

**Controlador:** `productCategoriesController.js`
**Repositorio:** `ProductCategoryRepository`
**Casos de uso:** `CreateProductCategory`, `UpdateProductCategory`, `GetProductCategory`, `GetProductCategoryById`, `DeleteProductCategory`

---

### 🏭 Producción (`/api/produccion`) — `productionRoutes.js`

| Método | Ruta                                       | Descripción                      | Auth |
| ------ | ------------------------------------------ | -------------------------------- | ---- |
| GET    | `/produccion/ordenes/estados`              | Listar estados válidos del flujo | —    |
| GET    | `/produccion/empleados/carga`              | Carga de trabajo por empleado    | —    |
| GET    | `/produccion/calendario`                   | Calendario de producción         | —    |
| GET    | `/produccion/alertas`                      | Alertas de producción            | —    |
| GET    | `/produccion/ordenes`                      | Listar órdenes                   | —    |
| GET    | `/produccion/ordenes/:id`                  | Obtener orden + detalles         | —    |
| POST   | `/produccion/ordenes`                      | Crear orden                      | 🔒   |
| PUT    | `/produccion/ordenes/:id`                  | Actualizar orden                 | —    |
| PATCH  | `/produccion/ordenes/:id/estado`           | Cambiar estado                   | 🔒   |
| PATCH  | `/produccion/ordenes/:id/asignar-empleado` | Asignar empleado a etapa         | 🔒   |
| PATCH  | `/produccion/ordenes/:id/confirmar-etapa`  | Confirmar etapa                  | 🔒   |
| PATCH  | `/produccion/ordenes/:id/anular`           | Anular orden                     | —    |
| POST   | `/produccion/ordenes/:id/historial`        | Agregar historial                | —    |

#### Detalles de orden

| Método | Ruta                            | Descripción                    |
| ------ | ------------------------------- | ------------------------------ |
| GET    | `/produccion/detalle-orden`     | Listar detalles (`?id_orden=`) |
| POST   | `/produccion/detalle-orden`     | Crear detalle                  |
| PUT    | `/produccion/detalle-orden/:id` | Actualizar detalle             |
| DELETE | `/produccion/detalle-orden/:id` | Eliminar detalle               |

#### Asignaciones de terceros

| Método | Ruta                                       | Descripción                     |
| ------ | ------------------------------------------ | ------------------------------- |
| GET    | `/produccion/asignaciones`                 | Listar asignaciones             |
| POST   | `/produccion/asignaciones`                 | Crear asignación                |
| DELETE | `/produccion/asignaciones/:id`             | Eliminar asignación             |
| DELETE | `/produccion/asignaciones/orden/:id_orden` | Eliminar asignaciones por orden |

**Estados válidos:** `Diseño`, `Ficha Técnica`, `Corte`, `Compras`, `Producción`, `Recepción`, `Enviado`, `Anulada`

**Validación:** esquema Zod (`shared/schemas/productionSchema.js`).

**Controlador:** `productionController.js`
**Repositorios:** `ProductionRepository`, `ProductionOrderDetailRepository`, `ThirdPartyAssignmentRepository`
**Casos de uso:** `CreateProduction`, `UpdateProduction`, `GetProductions`, `GetProductionById`, `GetProduction`, `AnularProduction`, `CambiarEstadoProduction`, `CreateOrderDetail`, `GetOrderDetails`, `GetCalendarioProduction`, `GetAlertasProduction`, `GetEmployeeWorkload`, `AsignarEmpleadoProduccion`, `ConfirmarEtapaProduccion`

---

### 🛒 Compras (`/api/compras`) — `purchaseRouter.js`

| Método | Ruta                            | Descripción                       | Auth |
| ------ | ------------------------------- | --------------------------------- | ---- |
| GET    | `/compras`                      | Listar compras                    | 🔒   |
| GET    | `/compras/:id`                  | Obtener compra + detalles         | 🔒   |
| POST   | `/compras`                      | Crear compra + detalles (atómico) | 🔒   |
| PUT    | `/compras/:id`                  | Actualizar cabecera               | 🔒   |
| DELETE | `/compras/:id`                  | Eliminar compra y detalles        | 🔒   |
| PATCH  | `/compras/:id/anular`           | Anular compra (`{ motivo }`)      | 🔒   |
| GET    | `/compras/detalle-purchase`     | Listar detalles (`?compraId=`)    | 🔒   |
| GET    | `/compras/detalle-purchase/:id` | Obtener detalle                   | 🔒   |
| POST   | `/compras/detalle-purchase`     | Crear detalle suelto              | 🔒   |

**Controlador:** `purchaseController.js`
**Repositorios:** `PurchaseRepository`, `PurchaseDetailRepository`
**Casos de uso:** `CreatePurchase`, `UpdatePurchase`, `GetPurchase`, `GetPurchaseById`, `DeletePurchase`, `AnularPurchase`, `CreatePurchaseDetail`, `GetPurchaseDetail`

---

### 🧵 Insumos (`/api/insumos`) — `supplyRouter.js`

| Método | Ruta                             | Descripción                         | Auth |
| ------ | -------------------------------- | ----------------------------------- | ---- |
| GET    | `/insumos/catalogos/medidas`     | Catálogo de medidas                 | 🔒   |
| GET    | `/insumos/catalogos/propiedades` | Catálogo de propiedades             | 🔒   |
| GET    | `/insumos/catalogos/categorias`  | Catálogo de categorías              | 🔒   |
| GET    | `/insumos`                       | Listar insumos                      | 🔒   |
| GET    | `/insumos/:id`                   | Obtener insumo                      | 🔒   |
| POST   | `/insumos`                       | Crear insumo (multipart con imagen) | 🔒   |
| PUT    | `/insumos/:id`                   | Actualizar insumo (multipart)       | 🔒   |
| DELETE | `/insumos/:id`                   | Eliminar insumo                     | 🔒   |
| PATCH  | `/insumos/:id/toggle`            | Activar/inactivar                   | 🔒   |

> `POST`/`PUT` usan `upload.single("imagen")` (multer). El frontend envía `multipart/form-data`.

**Controlador:** `supplyController.js`
**Repositorio:** `SupplyRepository`
**Casos de uso:** `CreateSupply`, `UpdateSupply`, `GetSupplies`, `GetSupplyById`, `DeleteSupply`

---

### 🗂️ Categorías de insumos (`/api/categorias-insumos`) — `supplyCategoryRoutes.js`

| Método | Ruta                      | Descripción                      | Auth |
| ------ | ------------------------- | -------------------------------- | ---- |
| GET    | `/categorias-insumos`     | Listar categorías                | 🔒   |
| GET    | `/categorias-insumos/:id` | Obtener categoría                | 🔒   |
| POST   | `/categorias-insumos`     | Crear categoría                  | 🔒   |
| PUT    | `/categorias-insumos/:id` | Actualizar categoría             | 🔒   |
| DELETE | `/categorias-insumos/:id` | Eliminar categoría (soft delete) | 🔒   |

**Controlador:** `supplyCategoryController.js`
**Repositorio:** `SupplyCategoryRepository`
**Casos de uso:** `CreateSupplyCategory`, `UpdateSupplyCategory`, `GetSuppliesCategory`, `GetSupplyCategoryById`, `DeleteSupplyCategory`

---

### 🎭 Roles (`/api/roles`) — `roleRouter.js`

| Método | Ruta                     | Descripción             | Auth |
| ------ | ------------------------ | ----------------------- | ---- |
| GET    | `/roles/catalogo`        | Catálogo de roles       | 🔒   |
| GET    | `/roles/:id/users-count` | Contar usuarios por rol | 🔒   |
| GET    | `/roles`                 | Listar roles            | 🔒   |
| GET    | `/roles/:id`             | Obtener rol             | 🔒   |
| POST   | `/roles`                 | Crear rol               | 🔒   |
| PUT    | `/roles/:id`             | Actualizar rol          | 🔒   |
| DELETE | `/roles/:id`             | Eliminar rol            | 🔒   |
| PATCH  | `/roles/:id/toggle`      | Activar/inactivar       | 🔒   |

**Controlador:** `roleController.js`
**Repositorio:** `RoleRepository`
**Casos de uso:** `CreateRole`, `UpdateRole`, `GetRole`, `GetRoleById`, `DeleteRole`

---

### 🏢 Sedes (`/api/sites`) — `siteRoutes.js`

| Método | Ruta                | Descripción             | Auth |
| ------ | ------------------- | ----------------------- | ---- |
| GET    | `/sites`            | Listar sedes (paginado) | 🔒   |
| GET    | `/sites/:id`        | Obtener sede            | 🔒   |
| POST   | `/sites`            | Crear sede              | 🔒   |
| PUT    | `/sites/:id`        | Actualizar sede         | 🔒   |
| DELETE | `/sites/:id`        | Eliminar sede           | 🔒   |
| PATCH  | `/sites/:id/toggle` | Activar/inactivar       | 🔒   |

**Query de listado:** `?search&estado&page&limit&sortBy&order`

**Controlador:** `siteController.js`
**Repositorio:** `SiteRepository`
**Casos de uso:** `CreateSites`, `UpdateSites`, `GetSites`, `GetSedeById`, `DeleteSites`

---

### 🧩 Módulos y privilegios

#### Módulos (`/api/modules`) — `moduleRoutes.js`

| Método | Ruta           | Descripción       | Auth |
| ------ | -------------- | ----------------- | ---- |
| GET    | `/modules`     | Listar módulos    | 🔒   |
| GET    | `/modules/:id` | Obtener módulo    | 🔒   |
| POST   | `/modules`     | Crear módulo      | 🔒   |
| PUT    | `/modules/:id` | Actualizar módulo | 🔒   |
| DELETE | `/modules/:id` | Eliminar módulo   | 🔒   |

#### Privilegios (`/api/privileges`) — `privilegeRoutes.js`

| Método | Ruta              | Descripción           | Auth |
| ------ | ----------------- | --------------------- | ---- |
| GET    | `/privileges`     | Listar privilegios    | 🔒   |
| GET    | `/privileges/:id` | Obtener privilegio    | 🔒   |
| POST   | `/privileges`     | Crear privilegio      | 🔒   |
| PUT    | `/privileges/:id` | Actualizar privilegio | 🔒   |
| DELETE | `/privileges/:id` | Eliminar privilegio   | 🔒   |

**Controladores:** `moduleController.js`, `privilegeController.js`
**Repositorios:** `ModuleRepository`, `PrivilegeRepository`

---

### 👥 Clientes (`/api/clients`) — `clientRoutes.js`

| Método | Ruta           | Descripción        | Auth |
| ------ | -------------- | ------------------ | ---- |
| GET    | `/clients`     | Listar clientes    | —    |
| GET    | `/clients/:id` | Obtener cliente    | —    |
| POST   | `/clients`     | Crear cliente      | —    |
| PUT    | `/clients/:id` | Actualizar cliente | —    |
| DELETE | `/clients/:id` | Eliminar cliente   | —    |

**Controlador:** `clientController.js`
**Repositorio:** `ClientRepository`

---

### 🖼️ Subida de archivos (`/api/upload`) — `uploadRoutes.js`

| Método | Ruta                       | Descripción                                    |
| ------ | -------------------------- | ---------------------------------------------- |
| POST   | `/upload/upload`           | Subir una imagen (campo `file`)                |
| POST   | `/upload/upload-multiple`  | Subir varias imágenes (campo `files`, máx. 10) |
| DELETE | `/upload/upload/:publicId` | Eliminar imagen de Cloudinary                  |

**Formato:** `multipart/form-data`. Almacena en Cloudinary (carpeta `unistock/products`). Límite 10MB. Solo imágenes (JPG, PNG, GIF, WebP).

**Config/servicio:** `cloudinary.config.js`, `cloudinary.service.js`, `multer.middleware.js`

---

### 📚 Swagger

- **UI:** `GET /api/docs`
- Generado con `swagger-jsdoc` + `swagger-ui-express`.
- Esquemas definidos para `ThirdParty`, `ProductionOrder`, `Error`.
- Autenticación: `bearerAuth` (JWT).

---

## 🎛️ Controladores

Archivos en `src/infrastructure/controllers/`:

| Controlador                   | Ruta del archivo                 | Responsabilidad                                               |
| ----------------------------- | -------------------------------- | ------------------------------------------------------------- |
| `clientController`            | `clientController.js`            | CRUD de clientes                                              |
| `moduleController`            | `moduleController.js`            | CRUD de módulos                                               |
| `privilegeController`         | `privilegeController.js`         | CRUD de privilegios                                           |
| `productCategoriesController` | `productCategoriesController.js` | CRUD de categorías de productos                               |
| `productController`           | `productController.js`           | CRUD de productos + fichas técnicas + materiales              |
| `productionController`        | `productionController.js`        | Órdenes, detalles, asignaciones, estados, calendario, alertas |
| `purchaseController`          | `purchaseController.js`          | Compras + detalles + anulación                                |
| `roleController`              | `roleController.js`              | CRUD de roles + catálogo + conteo de usuarios                 |
| `siteController`              | `siteController.js`              | CRUD de sedes + toggle                                        |
| `suppliersController`         | `suppliersController.js`         | CRUD de proveedores + toggle + has-purchases                  |
| `supplyCategoryController`    | `supplyCategoryController.js`    | CRUD de categorías de insumos                                 |
| `supplyController`            | `supplyController.js`            | CRUD de insumos + catálogos                                   |
| `thirdPartiesController`      | `thirdPartiesController.js`      | CRUD de terceros + toggle + link producción                   |
| `thirdPartyController`        | `thirdPartyController.js`        | CRUD de terceros (variante)                                   |
| `userController`              | `userController.js`              | Auth + CRUD de usuarios + perfil                              |

---

## 🧩 Casos de uso (Use Cases)

Carpeta: `src/application/use-cases/`

### Auth (`auth/`)

- `LoginUser` — autentica usuario y genera JWT.
- `ForgotPassword` — genera código de recuperación y envía correo.
- `VerifyCode` — valida el código de recuperación.
- `ResetPassword` — restablece contraseña con token.
- `ChangePassword` — cambia contraseña del autenticado.

### Product Categories (`productCategories/`)

- `CreateProductCategory`, `UpdateProductCategory`, `GetProductCategory`, `GetProductCategoryById`, `DeleteProductCategory`

### Producción (`production/`)

- `CreateProduction`, `UpdateProduction`, `GetProductions`, `GetProductionById`, `GetProduction`, `AnularProduction`, `CambiarEstadoProduction`, `CreateOrderDetail`, `GetOrderDetails`, `GetCalendarioProduction`, `GetAlertasProduction`, `GetEmployeeWorkload`, `AsignarEmpleadoProduccion`, `ConfirmarEtapaProduccion`

### Productos (`products/`)

- `CreateProduct`, `UpdateProduct`, `GetProduct`, `GetProductById`, `DeleteProduct`

### Compras (`purchases/`)

- `CreatePurchase`, `UpdatePurchase`, `GetPurchase`, `GetPurchaseById`, `DeletePurchase`, `AnularPurchase`, `CreatePurchaseDetail`, `GetPurchaseDetail`

### Roles (`roles/`)

- `CreateRole`, `UpdateRole`, `GetRole`, `GetRoleById`, `DeleteRole`

### Sedes (`sites/`)

- `CreateSites`, `UpdateSites`, `GetSites`, `GetSedeById`, `DeleteSites`

### Proveedores (`suppliers/`)

- `CreateSupplier`, `UpdateSupplier`, `GetSupplier`, `GetSupplierById`, `DeleteSupplier`

### Insumos (`supplies/`)

- `CreateSupply`, `UpdateSupply`, `GetSupplies`, `GetSupplyById`, `DeleteSupply`

### Categorías de insumos (`supplyCategories/`)

- `CreateSupplyCategory`, `UpdateSupplyCategory`, `GetSuppliesCategory`, `GetSupplyCategoryById`, `DeleteSupplyCategory`

### Terceros (`thirdParties/`)

- `CreateThirdParty`, `UpdateThirdParties`, `GetThirdParties`, `GetThirdPartiesById`, `DeleteThirdParties`, `LinkProduccion`

### Usuarios (`users/`)

- `CreateUser`, `UpdateUser`, `GetUser`, `GetUserById`, `DeleteUser`

---

## 🗄️ Repositorios

Carpeta: `src/infrastructure/repositories/`

| Repositorio                                 | Entidad                         | Métodos principales                                                             |
| ------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------- |
| `ClientRepository`                          | Client                          | `findAll`, `findById`, `create`, `update`, `delete`                             |
| `ModuleRepository`                          | Module                          | CRUD                                                                            |
| `PrivilegeRepository`                       | Privilege                       | CRUD                                                                            |
| `ProductCategoryRepository`                 | ProductCategory                 | `findAll`, `findById`, `create`, `update`, `delete`                             |
| `ProductionRepository`                      | Production                      | `findAll`, `findById`, `create`, `update`, `delete`                             |
| `ProductionOrderDetailRepository`           | ProductionOrderDetail           | `findAll`, `findById`, `create`, `update`, `delete`                             |
| `ProductRepository`                         | Products                        | `findAll`, `findById`, `findByReference`, `create`, `update`, `delete`          |
| `PurchaseRepository`                        | Purchase                        | `findAll`, `findById`, `create`, `update`, `delete`                             |
| `PurchaseDetailRepository`                  | PurchaseDetail                  | `findAll`, `findById`, `create`, `update`, `delete`                             |
| `RoleRepository`                            | Role                            | CRUD + `countUsers`                                                             |
| `SiteRepository`                            | Site                            | CRUD + `findAll` (paginado)                                                     |
| `SupplierRepository`                        | Suppliers                       | `findAll`, `findById`, `findByNit`, `findByEmail`, `create`, `update`, `delete` |
| `SupplyCategoryRepository`                  | SupplyCategory                  | CRUD                                                                            |
| `SupplyRepository`                          | Supply                          | CRUD + catálogos                                                                |
| `TechnicalSpecificationsRepository`         | TechnicalSpecifications         | CRUD fichas técnicas                                                            |
| `MaterialTechnicalSpecificationsRepository` | MaterialTechnicalSpecifications | CRUD materiales                                                                 |
| `ThirdPartiesRepository`                    | ThirdParties                    | CRUD                                                                            |
| `ThirdPartyAssignmentRepository`            | ThirdPartyAssignment            | `findAll`, `create`, `update`, `delete`                                         |
| `UserRepository`                            | User                            | CRUD + `findByIdWithPassword` + `findAllRoles` + `findAllSedes`                 |

**Patrón:** cada repositorio implementa `_toEntity(doc)` que convierte un documento Mongoose a la entidad de dominio (con `id` en string).

---

## 🗃️ Modelos de base de datos

Carpeta: `src/infrastructure/db/`

| Modelo                                    | Colección    | Campos principales                                                                   |
| ----------------------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| `ClientModel.js`                          | clients      | —                                                                                    |
| `HeadquarterTransferModel.js`             | —            | transferencias entre sedes                                                           |
| `MaterialTechnicalSpecificationsModel.js` | —            | materiales de fichas técnicas                                                        |
| `ModuleModel.js`                          | modules      | nombre                                                                               |
| `OrderProcessModel.js`                    | —            | procesos de orden                                                                    |
| `PasswordResetModel.js`                   | —            | tokens de recuperación                                                               |
| `PrivilegeModel.js`                       | privileges   | nombre                                                                               |
| `ProductCategoryModel.js`                 | —            | nombre, descripcion                                                                  |
| `ProductionOrderDetailModel.js`           | —            | id_orden, id_producto, cantidad, color                                               |
| `ProductionOrderModel.js`                 | —            | cliente, fecha_entrega, estado                                                       |
| `ProductionStateModel.js`                 | —            | estados de producción                                                                |
| `ProductModel.js`                         | products     | referencia, nombre, precio, stock, id_categorias, imagenes_Url                       |
| `PurchaseDetailModel.js`                  | —            | compraId, producto, cantidad                                                         |
| `PurchaseModel.js`                        | —            | proveedorId, numeroFactura                                                           |
| `RoleModel.js`                            | roles        | nombre, descripcion, estado, permisos                                                |
| `SiteModel.js`                            | sites        | nombre, ciudad, barrio, direccion, telefono, estado                                  |
| `StateChangeModel.js`                     | —            | cambios de estado                                                                    |
| `SuppliersModel.js`                       | suppliers    | nit, nombre_de_empresa, contacto, telefono, correo, activo                           |
| `SupplyCategoryModel.js`                  | —            | nombre, descripcion, estado                                                          |
| `SupplyModel.js`                          | —            | nombre, categoria, stock, medida, propiedades, imagen                                |
| `TechnicalSpecificationsModel.js`         | —            | id_producto, responsable, fecha_inicio, descripciones, versiones, fabrics, cups, ... |
| `ThirdPartiesModel.js`                    | thirdparties | nit, nombre, contacto, direccion, telefono, estado                                   |
| `ThirdPartyModel.js`                      | thirdparties | variante                                                                             |
| `ThirdPartyAssignmentModel.js`            | —            | id_orden, id_tercero, cantidad                                                       |
| `UserModel.js`                            | users        | nombreCompleto, correo, password, rolId, sedeId, estado                              |

---

## 🧬 Entidades de dominio

Carpeta: `src/domain/entities/`

Son **clases puras** (sin dependencias externas) que definen estructura y serialización (`toJSON`, `toPublic`).

| Entidad                         | Archivo                              |
| ------------------------------- | ------------------------------------ |
| HeadquarterTransfer             | `HeadquarterTransfer.js`             |
| MaterialTechnicalSpecifications | `MaterialTechnicalSpecifications.js` |
| Module                          | `Module.js`                          |
| OrderProcess                    | `OrderProcess.js`                    |
| Privilege                       | `Privilege.js`                       |
| ProductCategory                 | `ProductCategory.js`                 |
| Production                      | `Production.js`                      |
| ProductionOrderDetail           | `ProductionOrderDetail.js`           |
| ProductionState                 | `ProductionState.js`                 |
| Products                        | `Products.js`                        |
| Purchase                        | `Purchase.js`                        |
| PurchaseDetail                  | `PurchaseDetail.js`                  |
| Role                            | `Role.js`                            |
| Site                            | `Site.js`                            |
| StateChange                     | `StateChange.js`                     |
| Suppliers                       | `Suppliers.js`                       |
| Supply                          | `Supply.js`                          |
| SupplyCategory                  | `SupplyCategory.js`                  |
| TechnicalSpecifications         | `TechnicalSpecifications.js`         |
| ThirdParties                    | `ThirdParties.js`                    |
| ThirdPartyAssignment            | `ThirdPartyAssignment.js`            |
| User                            | `User.js`                            |

---

## 🛡️ Middlewares y seguridad

### `interfaces/middlewares/authMiddleware.js`

- **`requireAuth`**: valida JWT (firma + usuario activo en BD) y puebla `req.user` con datos actuales.
- **`requireRole(...roles)`**: restringe a roles específicos (ej. `"Gerente"`, `"Administrador"`).

### `interfaces/middlewares/validationMiddleware.js`

- **`validate`**: ejecuta reglas de validación.
- **`rules`**: definiciones de reglas por acción (login, forgotPassword, verifyCode, resetPassword, changePassword, listUsers, idParam, createUser, updateUser).

### `infrastructure/middlewares/validateSchema.js`

- **`validateSchema(schema)`**: valida `req.body` con un esquema **Zod**; en caso de error devuelve `400` con `errors` formateados (`field`, `message`, `code`).

### `infrastructure/middlewares/upload.js`

- Middleware multer para subida de archivos.

### `infrastructure/security/password_encrypter.js`

- **`compare`**: compara contraseña plana con hash (bcrypt).

### `infrastructure/security/token_generator.js`

- **`verify`**: verifica token JWT.

---

## 🧰 Utilidades y servicios compartidos

### `shared/utils/response.js`

Helpers de respuesta HTTP: `ok`, `created`, `noContent`, `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `unprocessable`, `serverError`.

### `shared/utils/emailService.js`

Envío de correos (Nodemailer) — usado para recuperación de contraseña y avisos.

### `shared/utils/generatePassword.js`

Genera contraseñas temporales.

### `shared/utils/managerAuth.js`

Validación de contraseña del gerente para acciones sensibles (eliminar/toggle).

### `shared/utils/rolePermissionValidator.js`

Valida permisos por módulo/rol.

### `shared/utils/claudinary.js`

Utilidades de Cloudinary.

### `shared/services/BackendService.js`

Cliente axios para consumir el backend secundario (`back_unictock`, puerto `3001`). Expone: `productCategoryAPI`, `productAPI`, `productionAPI`, `supplierAPI`, `roleAPI`, `siteAPI`.

### `shared/constants/rolePermissions.js`

Constantes de permisos por rol.

### `shared/schemas/`

- `productionSchema.js` — esquemas Zod para producción (`createOrderSchema`, `updateOrderSchema`, `cambiarEstadoSchema`, `anularOrderSchema`).
- `thirdPartySchema.js` — esquemas Zod para terceros (`createThirdPartySchema`, `updateThirdPartySchema`).

### `Config/database.js`

- Conexión MongoDB (Mongoose) con opciones de timeout.
- **`isDbConnected()`** — verifica estado de conexión.
- Contiene además un **store en memoria** con colecciones para modo sin BD.

### `Config/seedModulesPrivileges.js`

Seeder de módulos y privilegios base.

---

## 🧪 Testing

- `tests/api-smoke.js` — smoke test de la API.
- `tests/example.spec.js` — ejemplo Playwright.
- `tests/auth/ForgotPassword.test.js` — test de recuperación de contraseña.
- Configuración Playwright en `playwright.config.js`.

---

## 📌 Notas finales

- **Base URL:** `http://localhost:3000/api`
- **Health check:** `GET /health` → `{ status: "ok", timestamp }`
- **Docs Swagger:** `GET /api/docs`
- **Errores:** respuestas consistentes `{ success: false, message, errors? }`.
- **Límites de body:** JSON/urlencoded hasta `25mb`.

**Última actualización:** 2026

---
