/**
 * insumoRouter.js
 * 
 * Define las rutas para la gestión de Insumos.
 * 
 * Endpoints:
 * - GET    /insumos               - Listar insumos
 * - GET    /insumos/:id           - Obtener insumo
 * - POST   /insumos               - Crear insumo
 * - PUT    /insumos/:id           - Actualizar insumo
 * - DELETE /insumos/:id           - Eliminar insumo
 * 
 * Todos requieren autenticación (JWT token)
 * 
 * @author Unistock Team
 */

const { Router } = require("express");
const ctrl = require("../controllers/insumoController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();

// Middleware: Requerir autenticación en todos los endpoints
router.use(requireAuth);

// Rutas CRUD
router.get("/", ctrl.getInsumos);
router.get("/:id", ctrl.getInsumoById);
router.post("/", ctrl.createInsumo);
router.put("/:id", ctrl.updateInsumo);
router.delete("/:id", ctrl.deleteInsumo);

module.exports = router;