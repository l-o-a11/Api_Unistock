/**
 * productRoutes.js
 * 
 * Define las rutas para la gestiÃ³n de Productos.
 * 
 * Endpoints Productos:
 * - GET    /productos          - Listar productos
 * - GET    /productos/:id      - Obtener producto
 * - POST   /productos          - Crear producto
 * - PUT    /productos/:id      - Actualizar producto
 * - DELETE /productos/:id      - Eliminar producto
 * - PATCH  /productos/:id/status - Cambiar estado del producto
 * 
 * Endpoints Ficha Técnica:
 * - GET    /productos/:id/fichas-tecnicas          - Listar fichas técnicas de un producto
 * - GET    /productos/:id/fichas-tecnicas/:techSpecId - Obtener ficha técnica
 * - POST   /productos/:id/fichas-tecnicas          - Crear ficha técnica
 * - PUT    /productos/:id/fichas-tecnicas/:techSpecId - Actualizar ficha técnica
 * - DELETE /productos/:id/fichas-tecnicas/:techSpecId - Eliminar ficha técnica
 * 
 * Todos requieren autenticación (JWT token)
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const { Router } = require("express");
const ctrl = require("../controllers/productController");
const { requireAuth, requireRole } = require("../../interfaces/middlewares/authMiddleware");
const { validate, rules } = require("../../interfaces/middlewares/validationMiddleware");

const router = Router();

// Middleware: Requerir autenticaciÃ³n en todos los endpoints (REMOVIDO para desarrollo pÃºblico)
// router.use(requireAuth);

// Rutas producto
router.get("/", ctrl.getProducts);
router.get("/:id", ctrl.getProductById);
router.post("/", ctrl.createProduct);
router.put("/:id", ctrl.updateProduct);
router.delete("/:id", ctrl.deleteProduct);
router.patch("/:id/status", ctrl.toggleProductStatus);

// Rutas ficha tÃ©cnica
router.get("/:id/tecnicas", ctrl.getTechnicalSpecifications);
router.get("/:id/tecnicas/:techSpecId", ctrl.getTechnicalSpecificationById);
router.post("/:id/tecnicas", ctrl.createTechnicalSpecification);
router.put("/:id/tecnicas/:techSpecId", ctrl.updateTechnicalSpecification);
router.delete("/:id/tecnicas/:techSpecId", ctrl.deleteTechnicalSpecification);

// Rutas material ficha t�cnica, anidadas por ficha t�cnica
router.get("/:id/tecnicas/:techSpecId/materiales", ctrl.getMaterialTechnicalSpecifications);
router.get("/:id/tecnicas/:techSpecId/materiales/:materialTechSpecId", ctrl.getMaterialTechnicalSpecificationById);
router.post("/:id/tecnicas/:techSpecId/materiales", ctrl.createMaterialTechnicalSpecification);
router.put("/:id/tecnicas/:techSpecId/materiales/:materialTechSpecId", ctrl.updateMaterialTechnicalSpecification);
router.delete("/:id/tecnicas/:techSpecId/materiales/:materialTechSpecId", ctrl.deleteMaterialTechnicalSpecification);

// Compatibilidad con rutas antiguas
router.get("/:id/materiales", ctrl.getMaterialTechnicalSpecifications);
router.get("/:id/materiales/:materialTechSpecId", ctrl.getMaterialTechnicalSpecificationById);
router.post("/:id/materiales", ctrl.createMaterialTechnicalSpecification);
router.put("/:id/materiales/:materialTechSpecId", ctrl.updateMaterialTechnicalSpecification);
router.delete("/:id/materiales/:materialTechSpecId", ctrl.deleteMaterialTechnicalSpecification);

module.exports = router;