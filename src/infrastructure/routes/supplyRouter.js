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
const { requireAuth, requirePermission } = require("../../interfaces/middlewares/authMiddleware");
const upload = require('../cloudinary/multer.middleware');
const router = Router();
const MODULO = "insumos";

// Middleware: Requerir autenticación en todos los endpoints
router.use(requireAuth);

// Rutas de catálogos (deben ir ANTES de /:id para evitar conflictos de ruta)
router.get("/catalogos/medidas", requirePermission(MODULO, "leer"), ctrl.getMedidas);
router.get("/catalogos/propiedades", requirePermission(MODULO, "leer"), ctrl.getPropiedades);
router.get("/catalogos/categorias", requirePermission(MODULO, "leer"), ctrl.getCategorias);

// Rutas CRUD
router.get("/", requirePermission(MODULO, "leer"), ctrl.getSupplies);
router.get("/:id", requirePermission(MODULO, "leer"), ctrl.getSupplyById);
// upload.single('imagen') intercepta el archivo con campo "imagen"
// Si no se envía imagen, req.file será undefined (sin error)
router.post("/", requirePermission(MODULO, "crear"), upload.single("imagen"), ctrl.createSupply);
router.put("/:id", requirePermission(MODULO, "actualizar"), upload.single("imagen"), ctrl.updateSupply);
router.delete("/:id", requirePermission(MODULO, "eliminar"), ctrl.deleteSupply);
router.patch("/:id/toggle", requirePermission(MODULO, "actualizar"), ctrl.toggleSupply);

module.exports = router;