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
const upload   = require('../cloudinary/multer.middleware');
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
// upload.single('imagen') intercepta el archivo con campo "imagen"
// Si no se envía imagen, req.file será undefined (sin error)
router.post("/", upload.single("imagen"), ctrl.createSupply);
router.put("/:id", upload.single("imagen"), ctrl.updateSupply);
router.delete("/:id", ctrl.deleteSupply);
router.patch("/:id/toggle", ctrl.toggleSupply);

module.exports = router;