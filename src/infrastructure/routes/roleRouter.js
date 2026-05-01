/**
 * roleRouter.js
 * 
 * Define las rutas para la gestión de Roles.
 * 
 * Endpoints:
 * - GET    /roles               - Listar roles
 * - GET    /roles/:id           - Obtener rol
 * - POST   /roles               - Crear rol
 * - PUT    /roles/:id           - Actualizar rol
 * - DELETE /roles/:id           - Eliminar rol
 * 
 * Todos requieren autenticación (JWT token)
 * 
 * @author Unistock Team
 */

const { Router } = require("express");
const ctrl = require("../controllers/roleController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();

// Middleware: Requerir autenticación en todos los endpoints
router.use(requireAuth);

// Catalog routes
router.get("/modules", ctrl.getModules);
router.get("/privileges", ctrl.getPrivileges);

// Rutas CRUD
router.get("/", ctrl.getRoles);
router.get("/:id", ctrl.getRoleById);
router.post("/", ctrl.createRole);
router.put("/:id", ctrl.updateRole);
router.delete("/:id", ctrl.deleteRole);

module.exports = router;