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
const { requireAuth, requireRole } = require("../../interfaces/middlewares/authMiddleware");
const { validate, rules } = require("../../interfaces/middlewares/validationMiddleware");

const router = Router();

// Middleware: Requerir autenticaciÃ³n en todos los endpoints (REMOVIDO para desarrollo pÃºblico)
router.use(requireAuth);

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