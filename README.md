# API Unistock

## Descripcion general

Esta API REST de Unistock corre sobre Node.js, Express y MongoDB y expone la funcionalidad operativa del sistema: usuarios, roles, permisos, sedes, proveedores, compras, inventario, productos, producción, terceros, empleados y autenticación.

La aplicacion sigue una separacion por capas y se comunica con el frontend por medio de endpoints bajo /api. El backend centraliza la autenticacion, la validacion de permisos y la logica de negocio relevante para cada dominio.

---

## Donde esta cada cosa

```text
Api_Unistock/
├── app.js                             # Punto de entrada para arrancar la API
├── server.js                          # Entrypoint alterno / servidor base
├── package.json                       # Scripts y dependencias
├── vercel.json                        # Configuracion Vercel para despliegue serverless
├── src/
│   ├── app.js                         # Inicio de la aplicacion; conecta Mongo y lanza Express
│   ├── interfaces/server.js           # Configuracion principal de Express, CORS, body parser y rutas
│   ├── Config/
│   │   ├── database.js                # Conexion a MongoDB y estado de la DB
│   │   └── seedModulesPrivileges.js   # Semilla de modulos y privilegios
│   ├── domain/
│   │   └── entities/                  # Entidades del dominio
│   ├── application/
│   │   └── use-cases/                 # Casos de uso por modulo
│   ├── infrastructure/
│   │   ├── controllers/               # Controladores HTTP
│   │   ├── db/                        # Modelos Mongoose
│   │   ├── repositories/              # Repositorios de acceso a datos
│   │   ├── routes/                    # Definicion de rutas REST
│   │   ├── security/                  # JWT, password y seguridad
│   │   └── cloudinary/                # Upload de imagenes
│   ├── interfaces/
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js      # requireAuth, requireRole, requirePermission
│   │   │   └── validationMiddleware.js
│   │   └── server.js                  # Ver archivo de nivel superior
│   ├── shared/
│   │   ├── constants/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   └── swagger/
│       └── swagger.js                 # Documentacion OpenAPI / Swagger
├── database/
│   ├── unistock_schema.js             # Esquemas de base de datos
│   ├── unistock_data.js               # Datos base/seed
│   └── README.md                      # Notas de la base de datos
├── DOCUMENTACION_API.md               # Documentacion extensa por endpoints
├── ARCHITECTURE.md                    # Resumen de arquitectura
├── CONTRIBUTING.md                    # Guia de contribucion
└── README.md                          # Este archivo
```

---

## Arquitectura real

El backend sigue una arquitectura por capas:

1. Entrada HTTP
   - Express en src/interfaces/server.js
   - Rutas en src/infrastructure/routes
2. Adaptadores HTTP
   - Controladores en src/infrastructure/controllers
   - Validan entrada, llaman casos de uso y devuelven respuestas
3. Casos de uso
   - En src/application/use-cases
   - Encapsulan la logica de negocio del modulo
4. Acceso a datos
   - Repositorios en src/infrastructure/repositories
   - Modelos Mongoose en src/infrastructure/db
5. Dominio
   - Entidades puras bajo src/domain/entities

Flujo tipico:

```text
Request HTTP
  -> Ruta (/api/roles, /api/produccion, /api/users...)
  -> Controlador
  -> Caso de uso
  -> Repositorio
  -> Modelo Mongo / Mongoose
  -> Respuesta JSON
```

---

## Autenticacion y permisos

### Login

Route: POST /api/auth/login

Body esperado:

```json
{
  "correo": "admin@admin.com",
  "password": "admin123"
}
```

Respuesta esperada:

```json
{
  "success": true,
  "data": {
    "token": "jwt",
    "user": {
      "id": "...",
      "correo": "admin@admin.com",
      "rolNombre": "Gerente",
      "rolId": "...",
      "sedeId": "..."
    }
  }
}
```

### Seguridad del backend

El middleware requireAuth en src/interfaces/middlewares/authMiddleware.js hace lo siguiente:

- valida el JWT
- verifica que el usuario siga existiendo en la base de datos
- valida que el usuario este activo
- actualiza req.user con datos frescos de la base de datos

Esto evita que un usuario desactivado o con rol cambiado siga usando permisos vigentes desde un JWT viejo.

### Permisos por modulo

Cada ruta importante usa requirePermission(modulo, accion), por ejemplo:

```js
router.get("/", requirePermission(MODULO, "leer"), ctrl.getRoles);
router.post("/", requirePermission(MODULO, "crear"), ctrl.createRole);
```

Los permisos se guardan por rol y cada modulo tiene acciones como:

- leer
- crear
- actualizar
- eliminar

El frontend consulta estos permisos en /api/auth/me/permissions para decidir si un usuario puede acceder a cada vista.

---

## Mapa de endpoints principales

### Autenticacion

| Metodo | Ruta                      | Descripcion                  |
| ------ | ------------------------- | ---------------------------- |
| POST   | /api/auth/login           | Inicio de sesion             |
| POST   | /api/auth/forgot-password | Solicitar recuperacion       |
| POST   | /api/auth/verify-code     | Verificar codigo             |
| POST   | /api/auth/reset-password  | Cambiar password             |
| PUT    | /api/auth/change-password | Cambiar password autenticado |
| POST   | /api/auth/verify-password | Validar password actual      |
| GET    | /api/auth/me/permissions  | Permisos del usuario actual  |

### Usuarios

| Metodo | Ruta                         | Descripcion                 |
| ------ | ---------------------------- | --------------------------- |
| GET    | /api/users                   | Listar usuarios             |
| GET    | /api/users/:id               | Obtener usuario             |
| POST   | /api/users                   | Crear usuario               |
| PUT    | /api/users/:id               | Actualizar usuario          |
| PATCH  | /api/users/:id/toggle-status | Activar / inactivar usuario |
| DELETE | /api/users/:id               | Eliminar usuario            |

### Roles y permisos

| Metodo | Ruta                | Descripcion                                |
| ------ | ------------------- | ------------------------------------------ |
| GET    | /api/roles          | Listar roles                               |
| GET    | /api/roles/catalogo | Obtener catalogos de modulos y privilegios |
| POST   | /api/roles          | Crear rol                                  |
| PUT    | /api/roles/:id      | Editar rol                                 |
| DELETE | /api/roles/:id      | Eliminar rol                               |

### Sedes

| Metodo | Ruta                  | Descripcion         |
| ------ | --------------------- | ------------------- |
| GET    | /api/sites            | Listar sedes        |
| GET    | /api/sites/:id        | Detalle             |
| POST   | /api/sites            | Crear sede          |
| PUT    | /api/sites/:id        | Actualizar sede     |
| PATCH  | /api/sites/:id/toggle | Activar / inactivar |

### Proveedores

| Metodo | Ruta               | Descripcion          |
| ------ | ------------------ | -------------------- |
| GET    | /api/suppliers     | Listar               |
| GET    | /api/proveedores   | Alias de proveedores |
| GET    | /api/suppliers/:id | Obtener              |
| POST   | /api/suppliers     | Crear                |
| PUT    | /api/suppliers/:id | Actualizar           |
| DELETE | /api/suppliers/:id | Eliminar             |

### Compras

| Metodo | Ruta                    | Descripcion         |
| ------ | ----------------------- | ------------------- |
| GET    | /api/compras            | Listar compras      |
| POST   | /api/compras            | Crear compra        |
| GET    | /api/compras/:id        | Detalle             |
| PUT    | /api/compras/:id        | Actualizar cabecera |
| DELETE | /api/compras/:id        | Eliminar            |
| PATCH  | /api/compras/:id/anular | Anular compra       |

### Insumos

| Metodo | Ruta             | Descripcion |
| ------ | ---------------- | ----------- |
| GET    | /api/insumos     | Listar      |
| GET    | /api/insumos/:id | Detalle     |
| POST   | /api/insumos     | Crear       |
| PUT    | /api/insumos/:id | Actualizar  |
| DELETE | /api/insumos/:id | Eliminar    |

### Productos

| Metodo | Ruta                       | Descripcion     |
| ------ | -------------------------- | --------------- |
| GET    | /api/products              | Listar          |
| GET    | /api/products/:id          | Obtener         |
| POST   | /api/products              | Crear           |
| PUT    | /api/products/:id          | Actualizar      |
| PATCH  | /api/products/:id/status   | Cambiar estado  |
| GET    | /api/products/:id/tecnicas | Fichas tecnicas |

### Produccion

| Metodo | Ruta                                           | Descripcion      |
| ------ | ---------------------------------------------- | ---------------- |
| GET    | /api/produccion/ordenes                        | Listar ordenes   |
| GET    | /api/produccion/ordenes/:id                    | Obtener orden    |
| POST   | /api/produccion/ordenes                        | Crear orden      |
| PUT    | /api/produccion/ordenes/:id                    | Actualizar orden |
| PATCH  | /api/produccion/ordenes/:id/estado             | Cambiar estado   |
| PATCH  | /api/produccion/ordenes/:id/asignar-empleado   | Asignar empleado |
| PATCH  | /api/produccion/ordenes/:id/reasignar-empleado | Reasignar        |
| PATCH  | /api/produccion/ordenes/:id/confirmar-etapa    | Confirmar etapa  |
| PATCH  | /api/produccion/ordenes/:id/anular             | Anular orden     |
| GET    | /api/produccion/calendario                     | Calendario       |
| GET    | /api/produccion/alertas                        | Alertas          |

### Terceros

| Metodo | Ruta              | Descripcion |
| ------ | ----------------- | ----------- |
| GET    | /api/terceros     | Listar      |
| GET    | /api/terceros/:id | Obtener     |
| POST   | /api/terceros     | Crear       |
| PUT    | /api/terceros/:id | Actualizar  |
| DELETE | /api/terceros/:id | Eliminar    |

---

## Reglas de negocio importantes

Estas reglas no siempre aparecen en el frontend; las aplica el backend y son la base del comportamiento del sistema.

### 1. Usuarios

- Un usuario debe estar activo para usar la API.
- Si un usuario es desactivado, su JWT deja de ser valido para operaciones del sistema.
- Si el unico administrador activo intenta desactivarse, la operacion queda bloqueada.
- Si un usuario tiene produccion activa asignada, no puede inactivarse.
- Si un usuario se reactivara con rol Gerente y ya existe otro Gerente activo, se impide.

### 2. Roles y permisos

- Los roles tienen un conjunto de permisos por modulo.
- El acceso se valida en la base de datos, no solo en el token.
- Un usuario sin permiso sobre un modulo no puede operar ese endpoint aunque este autenticado.

### 3. Sedes

- Las sedes pueden activarse o inactivarse.
- Antes de borrar o desactivar elementos sensibles, el backend valida si hay dependencias activas.

### 4. Proveedores

- Debe evitarse la duplicidad de campos clave como nit y correo.
- La eliminacion de un proveedor puede bloquearse si ya tiene compras asociadas.

### 5. Compras

- La creacion de compra y detalles se gestiona como una operacion con apoyo transaccional.
- La anulacion de compra exige motivo.

### 6. Produccion

- Las ordenes de produccion tienen estados y etapas de trabajo.
- La asignacion de empleados no debe duplicar carga ni dejar empleados sin validacion.
- La confirmacion de etapa y el cambio de estado estan acoplados a reglas de negocio internas del dominio.
- Las ordenes pueden anularse con un motivo especifico y dejar historial.

### 7. Archivos y uploads

- El backend soporta subida de imagenes a Cloudinary a traves de /api/upload.
- Los archivos no se manejan como contenido binario en la logica principal; se procesan en un endpoint dedicado.

---

## Flujo de uso recomendado

### Flujo de login

1. El frontend envia POST /api/auth/login.
2. El backend valida credenciales y devuelve JWT + usuario.
3. El frontend guarda la sesion en almacenamiento local / session.
4. Cada request autenticado agrega Authorization: Bearer <token>.
5. El backend valida la sesion con requireAuth.
6. El middleware verifica permisos con requirePermission antes de ejecutar la accion.

### Flujo de un modulo administrativo

```text
Frontend page
  -> Hook / service
  -> httpClient
  -> /api/<modulo>
  -> requireAuth
  -> requirePermission
  -> Controller
  -> Use case
  -> Repository
  -> MongoDB
  -> Response JSON
```

### Ejemplo: crear un usuario

1. El frontend abre el formulario de usuarios.
2. El usuario llena datos y hace submit.
3. La peticion llega a POST /api/users.
4. El controller llama al caso de uso CreateUser.
5. El caso de uso valida:
   - correo unico
   - documento unico
   - rol valido
   - sede valida
   - restricciones de administrador
6. El repositorio persiste el usuario.
7. El backend devuelve 201 Created con el usuario creado.

---

## Estado del proyecto y TODO

### Estado actual

- El backend tiene rutas principales funcionando para auth, usuarios, roles, sedes, compras, insumos, productos, produccion, terceros, proveedores y uploads.
- La autenticacion y los permisos ya estan reforzados con validacion en la base de datos.
- El frontend usa permisos por modulo para proteger vistas.

### Pendientes documentados

- Consolidar aliases de rutas y nombres de endpoint para evitar ambiguedades entre plural/singular y nombres en español/ingles.
- Revisar y completar la documentacion de endpoints menos usados y de integraciones legacy.
- Validar la cobertura de pruebas automatizadas por modulo.
- Revisar el estado exacto de modulos que quedaron parcialmente migrados del backend anterior.
- Mantener los permisos y catalogos sincronizados con la semilla de modulos y privilegios.

---

## Documentacion relacionada

- ARCHITECTURE.md
- DOCUMENTACION_API.md
- database/README.md
- CONTRIBUTING.md

---

## Comandos basicos

```bash
npm install
npm run dev
npm start
```

La API queda normalmente disponible en:

```text
http://localhost:3000
```

La documentacion interactiva Swagger queda en:

```text
http://localhost:3000/api/docs
```

````

### Orden de Producción

```javascript
{
  id: Number,
  fecha_creacion: Date,
  fecha_entrega: Date,
  cliente: String,
  id_usuario: ObjectId
}
````

### Detalle de Orden

```javascript
{
  id: Number,
  id_orden: ObjectId,
  id_producto: ObjectId,
  cantidad: Number,
  color: String,
  estado: Boolean
}
```

### Asignación de Tercero

```javascript
{
  id: Number,
  id_orden: ObjectId,
  id_tercero: ObjectId,
  cantidad: Number,
  fecha: Date
}
```

---

## 🔧 Patrones de Desarrollo

### 1. Repository Pattern (Capa de Datos)

Abstrae el acceso a datos. Cambiar de BD es solo cambiar el repositorio.

### 2. Use Cases (Lógica de Negocio)

Encapsulan la lógica independiente de HTTP.

### 3. Controllers (HTTP Handlers)

Traducen requests HTTP a use cases.

### 4. Routes (Definición de Endpoints)

Mapean HTTP methods y paths a controladores.

---

## 📝 Códigos de Respuesta HTTP

| Código | Descripción                      |
| ------ | -------------------------------- |
| 200    | OK - Éxito                       |
| 201    | Created - Recurso creado         |
| 204    | No Content - Eliminado           |
| 400    | Bad Request - Solicitud inválida |
| 401    | Unauthorized - Sin autenticación |
| 404    | Not Found - No existe            |
| 409    | Conflict - Duplicado/Conflicto   |
| 500    | Internal Server Error            |

---

## 🔐 Seguridad

- ✅ Autenticación JWT
- ✅ Hash de contraseñas (Bcryptjs)
- ✅ CORS configurado
- ✅ Validación de entrada
- ✅ Middleware de autenticación

---

## 📝 Datos de Prueba

**Usuario Admin:**

- Email: admin@admin.com
- Password: admin123
- Rol: Administrador (2)

---

## 🛠️ Scripts NPM

```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
npm test         # Tests
```

---

## 📄 Dependencias Principales

- express (Framework HTTP)
- mongoose (ODM MongoDB)
- bcryptjs (Hash de contraseñas)
- jsonwebtoken (JWT)
- dotenv (Variables de entorno)
- cors (Control de origen cruzado)

---

## 🤝 Contribución

1. `git checkout -b feature/mi-feature`
2. `git commit -am 'Descripción'`
3. `git push origin feature/mi-feature`
4. Abre Pull Request

---

## 📄 Licencia

MIT

---

**Versión:** 1.0.0
**Última actualización:** 26 de Abril, 2026
