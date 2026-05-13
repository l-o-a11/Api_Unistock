/**
 * supplyRouter.js
 * 
 * Define las rutas para la gestión de Insumos.
 * 
 * Endpoints:
 * - GET    /supplies               - Listar insumos
 * - GET    /supplies/:id           - Obtener insumo
 * - POST   /supplies               - Crear insumo
 * - PUT    /supplies/:id           - Actualizar insumo
 * - DELETE /supplies/:id           - Eliminar insumo
 * 
 * Todos requieren autenticación (JWT token)
 * 
 * @author Unistock Team
 */

const { Router } = require("express");
const ctrl = require("../controllers/supplyController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();

// Middleware: Requerir autenticación en todos los endpoints
router.use(requireAuth);

// Rutas de catálogos (deben ir ANTES de /:id para evitar conflictos de ruta)
router.get("/catalogos/medidas",     ctrl.getMedidas);
router.get("/catalogos/propiedades", ctrl.getPropiedades);
router.get("/catalogos/categorias",  ctrl.getCategorias);

// Rutas CRUD
router.get("/", ctrl.getSupplies);
router.get("/:id", ctrl.getSupplyById);
router.post("/", ctrl.createSupply);
router.put("/:id", ctrl.updateSupply);
router.delete("/:id", ctrl.deleteSupply);

module.exports = router;