/**
 * BackendService.js
 * 
 * Servicio para conectar con la API del backend (back_unictock)
 * Proporciona métodos para consumir los endpoints del backend
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const axios = require('axios');

// Configurar la URL base del backend
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3020';

// Crear instancia de axios con configuración
const backendClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para agregar token JWT si existe
backendClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
backendClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      // Opcional: redirigir a login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Métodos para ProductCategory API del Backend
 */
const productCategoryAPI = {
  // Obtener todas las categorías
  getAll: (filters = {}) => {
    return backendClient.get('/api/product-categories', { params: filters });
  },

  // Obtener categoría por ID
  getById: (id) => {
    return backendClient.get(`/api/product-categories/${id}`);
  },

  // Crear nueva categoría
  create: (data) => {
    return backendClient.post('/api/product-categories', data);
  },

  // Actualizar categoría
  update: (id, data) => {
    return backendClient.put(`/api/product-categories/${id}`, data);
  },

  // Eliminar categoría
  delete: (id) => {
    return backendClient.delete(`/api/product-categories/${id}`);
  },
};

/**
 * Métodos para Product API del Backend
 */
const productAPI = {
  getAll: (filters = {}) => {
    return backendClient.get('/api/products', { params: filters });
  },

  getById: (id) => {
    return backendClient.get(`/api/products/${id}`);
  },

  create: (data) => {
    return backendClient.post('/api/products', data);
  },

  update: (id, data) => {
    return backendClient.put(`/api/products/${id}`, data);
  },

  delete: (id) => {
    return backendClient.delete(`/api/products/${id}`);
  },
};

/**
 * Métodos para Production API del Backend
 */
const productionAPI = {
  getAll: (filters = {}) => {
    return backendClient.get('/api/produccion', { params: filters });
  },

  getById: (id) => {
    return backendClient.get(`/api/produccion/${id}`);
  },

  create: (data) => {
    return backendClient.post('/api/produccion', data);
  },

  update: (id, data) => {
    return backendClient.put(`/api/produccion/${id}`, data);
  },

  delete: (id) => {
    return backendClient.delete(`/api/produccion/${id}`);
  },
};

/**
 * Métodos para Supplier API del Backend
 */
const supplierAPI = {
  getAll: (filters = {}) => {
    return backendClient.get('/api/proveedores', { params: filters });
  },

  getById: (id) => {
    return backendClient.get(`/api/proveedores/${id}`);
  },

  create: (data) => {
    return backendClient.post('/api/proveedores', data);
  },

  update: (id, data) => {
    return backendClient.put(`/api/proveedores/${id}`, data);
  },

  delete: (id) => {
    return backendClient.delete(`/api/proveedores/${id}`);
  },
};

const roleAPI = {
  getAll: (filters = {}) => {
    return backendClient.get('/api/roles', { params: filters });
  },

  getById: (id) => {
    return backendClient.get(`/api/roles/${id}`);
  },

  create: (data) => {
    return backendClient.post('/api/roles', data);
  },

  update: (id, data) => {
    return backendClient.put(`/api/roles/${id}`, data);
  },

  delete: (id) => {
    return backendClient.delete(`/api/roles/${id}`);
  },
};

const siteAPI = {
  getAll: (filters = {}) => {
    return backendClient.get('/api/sites', { params: filters });
  },

  getById: (id) => {
    return backendClient.get(`/api/sites/${id}`);
  },

  create: (data) => {
    return backendClient.post('/api/sites', data);
  },

  update: (id, data) => {
    return backendClient.put(`/api/sites/${id}`, data);
  },

  delete: (id) => {
    return backendClient.delete(`/api/sites/${id}`);
  },
};


module.exports = {
  backendClient,
  productCategoryAPI,
  productAPI,
  productionAPI,
  supplierAPI,
  roleAPI,
  siteAPI,
};
