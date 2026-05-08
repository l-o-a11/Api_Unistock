/**
 * productRoutes.js
 * 
 * Define las rutas para la gestión de Productos.
 * 
 * Endpoints:
 * - GET    /productos          - Listar productos
 * - GET    /productos/:id      - Obtener producto
 * - POST   /productos          - Crear producto
 * - PUT    /productos/:id      - Actualizar producto
 * - DELETE /productos/:id      - Eliminar producto
 * 
 * Endpoints para ficha técnica:
 * - GET    /productos/:id/tecnicas          - Listar fichas técnicas de un producto
 * - GET    /productos/:id/tecnicas/:techSpecId - Obtener ficha técnica por ID
 * - POST   /productos/:id/tecnicas          - Crear ficha técnica para un producto
 * - PUT    /productos/:id/tecnicas/:techSpecId - Actualizar ficha técnica por ID
 * - DELETE /productos/:id/tecnicas/:techSpecId - Eliminar ficha técnica por ID
 * 
 * Todos requieren autenticación (JWT token)
 * 
 * @author Unistock Team
 * @version 1.0.0
 * - GET    /productos/:id      - Obtener producto
 * - POST   /productos          - Crear producto
 * - PUT    /productos/:id      - Actualizar producto
 * - DELETE /productos/:id      - Eliminar producto
 * 
 * Todos requieren autenticación (JWT token)
 * 
 * @author Unistock Team
 */

const { Router } = require("express");
const ctrl = require("../controllers/productController");
const { requireAuth, requireRole } = require("../../interfaces/middlewares/authMiddleware");
const { validate, rules } = require("../../interfaces/middlewares/validationMiddleware");

const router = Router();

// Middleware: Requerir autenticación en todos los endpoints (REMOVIDO para desarrollo público)
// router.use(requireAuth);

// Rutas producto
router.get("/", ctrl.getProducts);
router.get("/:id", ctrl.getProductById);
router.post("/", ctrl.createProduct);
router.put("/:id", ctrl.updateProduct);
router.delete("/:id", ctrl.deleteProduct);

// Rutas ficha técnica
router.get("/:id/tecnicas", ctrl.getTechnicalSpecifications);
router.get("/:id/tecnicas/:techSpecId", ctrl.getTechnicalSpecificationById);
router.post("/:id/tecnicas", ctrl.createTechnicalSpecification);
router.put("/:id/tecnicas/:techSpecId", ctrl.updateTechnicalSpecification);
router.delete("/:id/tecnicas/:techSpecId", ctrl.deleteTechnicalSpecification);
router.patch(
  "/:id/status",
  requireRole("Gerente", "Administrador"),
  rules.idParam,
  validate,
  ctrl.toggleProductStatus 
);

// Rutas material ficha técnica
router.get("/:id/tecnicas/:techSpecId/materiales", ctrl.getMaterialTechnicalSpecifications);
router.get("/:id/tecnicas/:techSpecId/materiales/:materialTechSpecId", ctrl.getMaterialTechnicalSpecificationById);
router.post("/:id/tecnicas/:techSpecId/materiales", ctrl.createMaterialTechnicalSpecification);
router.put("/:id/tecnicas/:techSpecId/materiales/:materialTechSpecId", ctrl.updateMaterialTechnicalSpecification);
router.delete("/:id/tecnicas/:techSpecId/materiales/:materialTechSpecId", ctrl.deleteMaterialTechnicalSpecification);

module.exports = router;