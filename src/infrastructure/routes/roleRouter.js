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
 * - PATCH  /roles/:id/status - Cambiar estado del rol
 * 
 * Todos requieren autenticación (JWT token)
 * 
 * @author Unistock Team
 */

const { Router } = require("express");
const ctrl = require("../controllers/roleController");
const { requireAuth, requirePermission } = require("../../interfaces/middlewares/authMiddleware");
const { validate, rules } = require("../../interfaces/middlewares/validationMiddleware");

const router = Router();
const MODULO = "roles";

// Middleware: Requerir autenticación en todos los endpoints
router.use(requireAuth);

// Catalog routes
router.get("/catalogo", requirePermission(MODULO, "leer"), ctrl.getCatalogos);

router.get("/:id/users-count", requirePermission(MODULO, "leer"), ctrl.countUsersByRole);

// Rutas CRUD
router.get("/", requirePermission(MODULO, "leer"), ctrl.getRoles);
router.get("/:id", requirePermission(MODULO, "leer"), ctrl.getRoleById);
router.post("/", requirePermission(MODULO, "crear"), ctrl.createRole);
router.put("/:id", requirePermission(MODULO, "actualizar"), ctrl.updateRole);
router.delete("/:id", requirePermission(MODULO, "eliminar"), ctrl.deleteRole);
router.patch("/:id/toggle", requirePermission(MODULO, "actualizar"), ctrl.toggleRole);

module.exports = router;