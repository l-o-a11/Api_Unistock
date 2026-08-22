/**
 * productRoutes.js
 *
 * Define las rutas para la gestion de Productos.
 *
 * Endpoints Productos (montados en /api/products):
 * - GET    /api/products          - Listar productos
 * - GET    /api/products/:id      - Obtener producto
 * - POST   /api/products          - Crear producto
 * - PUT    /api/products/:id      - Actualizar producto
 * - DELETE /api/products/:id      - Eliminar producto
 * - PATCH  /api/products/:id/status - Cambiar estado del producto
 *
 * Endpoints Ficha Tecnica:
 * - GET    /api/products/:id/tecnicas          - Listar fichas tecnicas de un producto
 * - GET    /api/products/:id/tecnicas/:techSpecId - Obtener ficha tecnica
 * - POST   /api/products/:id/tecnicas          - Crear ficha tecnica
 * - PUT    /api/products/:id/tecnicas/:techSpecId - Actualizar ficha tecnica
 * - DELETE /api/products/:id/tecnicas/:techSpecId - Eliminar ficha tecnica
 *
 * Todos requieren autenticacion (JWT token)
 *
 * @author Unistock Team
 * @version 1.0.0
 */

const { Router } = require("express");
const ctrl = require("../controllers/productController");
const { requireAuth, requirePermission } = require("../../interfaces/middlewares/authMiddleware");
const { validate, rules } = require("../../interfaces/middlewares/validationMiddleware");

const router = Router();
const MODULO = "productos";

// Middleware: Requerir autenticacion en todos los endpoints
router.use(requireAuth);

// Rutas producto
router.get("/", requirePermission(MODULO, "leer"), ctrl.getProducts);
router.get("/:id", requirePermission(MODULO, "leer"), ctrl.getProductById);
router.post("/", requirePermission(MODULO, "crear"), ctrl.createProduct);
router.put("/:id", requirePermission(MODULO, "actualizar"), ctrl.updateProduct);
router.delete("/:id", requirePermission(MODULO, "eliminar"), ctrl.deleteProduct);
router.patch("/:id/status", requirePermission(MODULO, "actualizar"), ctrl.toggleProductStatus);

// Rutas ficha tecnica
router.get("/:id/tecnicas", requirePermission(MODULO, "leer"), ctrl.getTechnicalSpecifications);
router.get("/:id/tecnicas/:techSpecId", requirePermission(MODULO, "leer"), ctrl.getTechnicalSpecificationById);
router.post("/:id/tecnicas", requirePermission(MODULO, "crear"), ctrl.createTechnicalSpecification);
router.put("/:id/tecnicas/:techSpecId", requirePermission(MODULO, "actualizar"), ctrl.updateTechnicalSpecification);
router.delete("/:id/tecnicas/:techSpecId", requirePermission(MODULO, "eliminar"), ctrl.deleteTechnicalSpecification);

// Rutas material ficha tecnica, anidadas por ficha tecnica
router.get("/:id/tecnicas/:techSpecId/materiales", requirePermission(MODULO, "leer"), ctrl.getMaterialTechnicalSpecifications);
router.get("/:id/tecnicas/:techSpecId/materiales/:materialTechSpecId", requirePermission(MODULO, "leer"), ctrl.getMaterialTechnicalSpecificationById);
router.post("/:id/tecnicas/:techSpecId/materiales", requirePermission(MODULO, "crear"), ctrl.createMaterialTechnicalSpecification);
router.put("/:id/tecnicas/:techSpecId/materiales/:materialTechSpecId", requirePermission(MODULO, "actualizar"), ctrl.updateMaterialTechnicalSpecification);
router.delete("/:id/tecnicas/:techSpecId/materiales/:materialTechSpecId", requirePermission(MODULO, "eliminar"), ctrl.deleteMaterialTechnicalSpecification);

// Compatibilidad con rutas antiguas
router.get("/:id/materiales", requirePermission(MODULO, "leer"), ctrl.getMaterialTechnicalSpecifications);
router.get("/:id/materiales/:materialTechSpecId", requirePermission(MODULO, "leer"), ctrl.getMaterialTechnicalSpecificationById);
router.post("/:id/materiales", requirePermission(MODULO, "crear"), ctrl.createMaterialTechnicalSpecification);
router.put("/:id/materiales/:materialTechSpecId", requirePermission(MODULO, "actualizar"), ctrl.updateMaterialTechnicalSpecification);
router.delete("/:id/materiales/:materialTechSpecId", requirePermission(MODULO, "eliminar"), ctrl.deleteMaterialTechnicalSpecification);

module.exports = router;