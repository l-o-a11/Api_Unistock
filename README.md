# 📦 API Unistock - Sistema de Gestión Integral

## Descripción General

**Unistock** es una API RESTful desarrollada con **Node.js**, **Express** y **MongoDB** que proporciona un sistema completo de gestión para empresas de producción, incluyendo:

- 👥 **Gestión de Usuarios** (Admin, Operarios)
- 📋 **Gestión de Proveedores** (Suppliers)
- 👨‍💼 **Gestión de Terceros** (Contratistas externos)
- 🏭 **Órdenes de Producción** (Production Orders)
- 🔄 **Asignación de Terceros a Órdenes**
- 📊 **Estados y Procesos de Producción**
- 🏢 **Traslado entre Sedes**

---

## 🏗️ Arquitectura

El proyecto implementa **Arquitectura Limpia** (Clean Architecture) con separación clara de responsabilidades:

```
src/
├── app.js                          # Punto de entrada principal
├── Config/
│   └── database.js                 # Configuración de BD
├── domain/                         # Capa de Dominio
│   └── entities/                   # Entidades del dominio
├── application/                    # Capa de Aplicación
│   └── use-cases/                  # Casos de uso
├── infrastructure/                 # Capa de Infraestructura
│   ├── db/                         # Modelos Mongoose
│   ├── repositories/               # Repositorios (Data Access)
│   ├── controllers/                # Controladores HTTP
│   └── routes/                     # Definición de rutas
└── interfaces/                     # Capa de Interfaces
    ├── server.js                   # Configuración Express
    └── middlewares/
```

---

## 🚀 Instalación

### Requisitos Previos
- Node.js >= 14.x
- npm >= 6.x
- MongoDB (local o Atlas)

### Pasos

```bash
# Clonar repositorio
git clone <repo-url>
cd Api_Unistock

# Instalar dependencias
npm install

# Crear .env
cp .env.example .env
```

### Configurar Variables de Entorno
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/unistock
JWT_SECRET=your_secret_key
```

### Iniciar
```bash
npm run dev     # Desarrollo
npm start       # Producción
```

API disponible en: http://localhost:3000

---

## 🔐 Autenticación

### Login
```http
POST /auth/login
{
  "correo": "admin@admin.com",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Usar en Requests
```http
Authorization: Bearer <token>
```

---

## 📚 Endpoints API

### PROVEEDORES (Suppliers)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /proveedores | Listar proveedores |
| GET | /proveedores/:id | Obtener proveedor |
| POST | /proveedores | Crear proveedor |
| PUT | /proveedores/:id | Actualizar proveedor |
| DELETE | /proveedores/:id | Eliminar proveedor |

**Crear Proveedor:**
```json
POST /proveedores
{
  "nit": 123456789,
  "nombre_de_empresa": "Proveedor XYZ",
  "nombre_del_contacto": "Juan Pérez",
  "direccion": "Calle 1 #123",
  "telefono": 3101234567,
  "correo": "contacto@proveedor.com",
  "sitio_web": "www.proveedor.com"
}
```

---

### TERCEROS (Third Parties)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /terceros | Listar terceros |
| GET | /terceros/:id | Obtener tercero |
| POST | /terceros | Crear tercero |
| PUT | /terceros/:id | Actualizar tercero |
| DELETE | /terceros/:id | Eliminar tercero |

**Crear Tercero:**
```json
POST /terceros
{
  "nombre": "Servicio de Logística",
  "contacto": "Carlos López",
  "barrio": "Centro",
  "direccion": "Carrera 5 #50",
  "telefono": "3109876543"
}
```

---

### PRODUCCIÓN (Production Orders)

#### Órdenes de Producción

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /produccion/ordenes | Listar órdenes |
| GET | /produccion/ordenes/:id | Obtener orden |
| POST | /produccion/ordenes | Crear orden |
| PUT | /produccion/ordenes/:id | Actualizar orden |
| DELETE | /produccion/ordenes/:id | Eliminar orden |

**Crear Orden:**
```json
POST /produccion/ordenes
{
  "fecha_entrega": "2026-05-30",
  "cliente": "Empresa Cliente SA",
  "id_usuario": 1
}
```

#### Detalles de Órdenes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /produccion/detalle-orden | Listar detalles |
| POST | /produccion/detalle-orden | Agregar detalle |

**Agregar Detalle:**
```json
POST /produccion/detalle-orden
{
  "id_orden": 1,
  "id_producto": 5,
  "cantidad": 100,
  "color": "Rojo"
}
```

#### Asignación de Terceros

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /produccion/asignaciones | Listar asignaciones |
| POST | /produccion/asignaciones | Asignar tercero |

**Asignar Tercero:**
```json
POST /produccion/asignaciones
{
  "id_orden": 1,
  "id_tercero": 2,
  "cantidad": 50
}
```

---

## 📊 Estructura de Datos

### Proveedor
```javascript
{
  id: Number,
  nit: Number (único),
  nombre_de_empresa: String,
  nombre_del_contacto: String,
  direccion: String,
  telefono: Number,
  correo: String (único),
  sitio_web: String,
  activo: Boolean
}
```

### Tercero
```javascript
{
  id: Number,
  nombre: String,
  contacto: String,
  barrio: String,
  direccion: String,
  telefono: String,
  estado: Boolean
}
```

### Orden de Producción
```javascript
{
  id: Number,
  fecha_creacion: Date,
  fecha_entrega: Date,
  cliente: String,
  id_usuario: ObjectId
}
```

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

| Código | Descripción |
|--------|-------------|
| 200 | OK - Éxito |
| 201 | Created - Recurso creado |
| 204 | No Content - Eliminado |
| 400 | Bad Request - Solicitud inválida |
| 401 | Unauthorized - Sin autenticación |
| 404 | Not Found - No existe |
| 409 | Conflict - Duplicado/Conflicto |
| 500 | Internal Server Error |

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
