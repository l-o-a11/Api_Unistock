/**
 * suppliersRoutes.js
 * 
 * Define las rutas para la gestión de Proveedores.
 * 
 * Endpoints:
 * - GET    /proveedores          - Listar proveedores
 * - GET    /proveedores/:id      - Obtener proveedor
 * - POST   /proveedores          - Crear proveedor
 * - PUT    /proveedores/:id      - Actualizar proveedor
 * - DELETE /proveedores/:id      - Eliminar proveedor
 * 
 * Todos requieren autenticación (JWT token)
 * 
 * @author Unistock Team
 */

const { Router } = require("express");
const ctrl = require("../controllers/suppliersController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();

// Middleware: Requerir autenticación en todos los endpoints
router.use(requireAuth);

// Rutas CRUD
router.get("/", ctrl.getSuppliers);
router.get("/:id", ctrl.getSupplierById);
router.post("/", ctrl.createSupplier);
router.put("/:id", ctrl.updateSupplier);
router.delete("/:id", ctrl.deleteSupplier);

module.exports = router;
