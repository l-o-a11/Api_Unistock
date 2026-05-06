# 🚀 Guía de Conexión Frontend (React) → Backend (API)

## 📋 Requisitos en tu Frontend React

### 1. **Crear archivo de configuración de la API**

En tu proyecto React, crea `src/services/api.js`:

```javascript
import axios from "axios";

// Configuración base del cliente HTTP
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token JWT a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o no válido
      localStorage.removeItem("authToken");
      window.location.href = "/login"; // Redirige al login
    }
    return Promise.reject(error);
  },
);

export default api;
```

### 2. **Crear archivo .env.local en tu Frontend**

```env
VITE_API_URL=http://localhost:3000
```

### 3. **Ejemplos de Servicios**

Crea `src/services/authService.js`:

```javascript
import api from "./api";

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token } = response.data;
    localStorage.setItem("authToken", token);
    return response.data;
  },

  // Registro
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("authToken");
  },

  // Verificar si está autenticado
  isAuthenticated: () => !!localStorage.getItem("authToken"),
};
```

Crea `src/services/userService.js`:

```javascript
import api from "./api";

export const userService = {
  // Obtener todos los usuarios
  getUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Crear usuario
  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
```

Crea `src/services/productService.js`:

```javascript
import api from "./api";

export const productService = {
  // Obtener todos los productos
  getProducts: async () => {
    const response = await api.get("/productos");
    return response.data;
  },

  // Obtener producto por ID
  getProductById: async (id) => {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  },

  // Crear producto
  createProduct: async (productData) => {
    const response = await api.post("/productos", productData);
    return response.data;
  },

  // Actualizar producto
  updateProduct: async (id, productData) => {
    const response = await api.put(`/productos/${id}`, productData);
    return response.data;
  },

  // Eliminar producto
  deleteProduct: async (id) => {
    const response = await api.delete(`/productos/${id}`);
    return response.data;
  },
};
```

### 4. **Uso en componentes React**

```javascript
import { useEffect, useState } from "react";
import { userService } from "../services/userService";

export function UsersList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.message || "Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {users.map((user) => (
        <div key={user._id}>
          <h3>{user.nombre}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}
```

### 5. **Instalaciones necesarias en tu Frontend**

```bash
npm install axios
# o si usas yarn
yarn add axios
```

---

## 🔐 Endpoints disponibles en tu API

### Autenticación

- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `POST /auth/logout` - Logout

### Usuarios

- `GET /users` - Obtener todos
- `GET /users/:id` - Obtener por ID
- `POST /users` - Crear
- `PUT /users/:id` - Actualizar
- `DELETE /users/:id` - Eliminar

### Productos

- `GET /productos` - Obtener todos
- `GET /productos/:id` - Obtener por ID
- `POST /productos` - Crear
- `PUT /productos/:id` - Actualizar
- `DELETE /productos/:id` - Eliminar

### Otros Endpoints

- `GET /insumos` - Suministros
- `GET /compras` - Compras
- `GET /produccion` - Producción
- `GET /roles` - Roles
- `GET /sites` - Sitios
- `GET /proveedores` - Proveedores
- `GET /terceros` - Terceros
- (Y más según lo implementado)

---

## ✅ Checklist de Conexión

- [ ] Backend corriendo en puerto 3000
- [ ] CORS configurado en el backend
- [ ] Archivo `api.js` creado en frontend
- [ ] `.env.local` con `VITE_API_URL` en frontend
- [ ] Servicios creados (authService, userService, etc.)
- [ ] Axios instalado: `npm install axios`
- [ ] Pruebas en componentes React

---

## 🧪 Prueba rápida con Postman/Insomnia

1. `POST http://localhost:3000/auth/login`
   ```json
   {
     "email": "usuario@test.com",
     "password": "password123"
   }
   ```
2. Copia el `token` de la respuesta
3. En las siguientes peticiones, agrega header:
   ```
   Authorization: Bearer {token}
   ```

---

## 📍 Puertos por defecto

- **Backend**: http://localhost:3000
- **Frontend (Vite)**: http://localhost:5173
- **Frontend (Create React App)**: http://localhost:3000 → Cambiar en package.json

Si usas Create React App, actualiza el puerto en `package.json`:

```json
"start": "PORT=3001 react-scripts start"
```

---

## 🐛 Troubleshooting

### Error: CORS policy blocked

- Verifica que `FRONTEND_URL` en `.env` coincida con tu frontend
- Reinicia el servidor backend después de cambiar `.env`

### 401 Unauthorized

- El token expiró o no es válido
- Haz login nuevamente

### Network Error / Connection refused

- Backend no está corriendo
- Verifica puerto 3000: `npm start`
