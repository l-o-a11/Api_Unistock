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
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

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
  // ── Órdenes ──────────────────────────────────────────────────────────
  // Listar órdenes de producción
  getAll: (filters = {}) => {
    return backendClient.get('/api/produccion/ordenes', { params: filters });
  },

  // Obtener orden por ID (con detalles, asignaciones y historial)
  getById: (id) => {
    return backendClient.get(`/api/produccion/ordenes/${id}`);
  },

  // Crear nueva orden
  create: (data) => {
    return backendClient.post('/api/produccion/ordenes', data);
  },

  // Actualizar orden (PUT)
  update: (id, data) => {
    return backendClient.put(`/api/produccion/ordenes/${id}`, data);
  },

  // Cambiar estado de la orden (gerente avanza el flujo)
  cambiarEstado: (id, estado, extra = {}) => {
    return backendClient.patch(`/api/produccion/ordenes/${id}/estado`, { estado, ...extra });
  },

  // Anular orden
  anular: (id, motivo) => {
    return backendClient.patch(`/api/produccion/ordenes/${id}/anular`, { motivo });
  },

  // Listar estados válidos
  getEstados: () => {
    return backendClient.get('/api/produccion/ordenes/estados');
  },

  // Agregar entrada al historial
  agregarHistorial: (id, data) => {
    return backendClient.post(`/api/produccion/ordenes/${id}/historial`, data);
  },

  // ── Empleados ────────────────────────────────────────────────────────
  // Carga laboral de empleados (para asignar responsable en Corte/Compras/Recepción)
  getEmployeeWorkload: (cargo) => {
    const params = cargo ? { cargo } : {};
    return backendClient.get('/api/produccion/empleados/carga', { params });
  },

  // Asignar empleado a la etapa actual
  asignarEmpleado: (id, id_empleado) => {
    return backendClient.patch(`/api/produccion/ordenes/${id}/asignar-empleado`, { id_empleado });
  },

  // Reasignar empleado (reemplazo con justificación/motivo)
  reasignarEmpleado: (id, id_empleado, motivo) => {
    return backendClient.patch(`/api/produccion/ordenes/${id}/reasignar-empleado`, { id_empleado, motivo });
  },

  // Confirmar etapa por empleado asignado
  confirmarEtapa: (id) => {
    return backendClient.patch(`/api/produccion/ordenes/${id}/confirmar-etapa`);
  },

  // ── Información de producción ────────────────────────────────────────
  // Calendario de órdenes
  getCalendario: (desde, hasta) => {
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return backendClient.get('/api/produccion/calendario', { params });
  },

  // Alertas de órdenes
  getAlertas: () => {
    return backendClient.get('/api/produccion/alertas');
  },

  // ── Detalles de orden ────────────────────────────────────────────────
  getDetalles: (filters = {}) => {
    return backendClient.get('/api/produccion/detalle-orden', { params: filters });
  },

  // Crear detalle de orden
  createDetalle: (data) => {
    return backendClient.post('/api/produccion/detalle-orden', data);
  },

  // Actualizar detalle de orden
  updateDetalle: (id, data) => {
    return backendClient.put(`/api/produccion/detalle-orden/${id}`, data);
  },

  // Eliminar detalle de orden
  deleteDetalle: (id) => {
    return backendClient.delete(`/api/produccion/detalle-orden/${id}`);
  },

  // ── Asignaciones de terceros ─────────────────────────────────────────
  getAsignaciones: (filters = {}) => {
    return backendClient.get('/api/produccion/asignaciones', { params: filters });
  },

  // Crear asignación de tercero
  createAsignacion: (data) => {
    return backendClient.post('/api/produccion/asignaciones', data);
  },

  // Eliminar asignación individual
  deleteAsignacion: (id) => {
    return backendClient.delete(`/api/produccion/asignaciones/${id}`);
  },

  // Eliminar todas las asignaciones de una orden
  deleteAsignacionesByOrder: (id_orden) => {
    return backendClient.delete(`/api/produccion/asignaciones/orden/${id_orden}`);
  },

  // ── Compatibilidad ───────────────────────────────────────────────────
  // DELETE (anula con motivo por defecto — la API no tiene DELETE real para órdenes)
  delete: (id) => {
    return backendClient.delete(`/api/produccion/ordenes/${id}`);
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


const ProductionAPIClient = productionAPI;

module.exports = {
  backendClient,
  productCategoryAPI,
  productAPI,
  productionAPI,
  ProductionAPIClient,
  supplierAPI,
  roleAPI,
  siteAPI,
};
