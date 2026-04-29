/**
 * rolRouter.js
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
const ctrl = require("../controllers/rolController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();

// Middleware: Requerir autenticación en todos los endpoints
router.use(requireAuth);

// Rutas de catálogo
router.get("/modulos", ctrl.getModulos);
router.get("/privilegios", ctrl.getPrivilegios);

// Rutas CRUD
router.get("/", ctrl.getRoles);
router.get("/:id", ctrl.getRolById);
router.post("/", ctrl.createRol);
router.put("/:id", ctrl.updateRol);
router.delete("/:id", ctrl.deleteRol);

module.exports = router;