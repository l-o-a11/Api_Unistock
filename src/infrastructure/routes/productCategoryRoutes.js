/**
 * productCategoryRoutes.js
 * 
 * Define las rutas para la gestión de Categorías de Productos.
 * 
 * Endpoints:
 * - GET    /product-categories         - Listar categorías
 * - GET    /product-categories/:id      - Obtener categoría
 * - POST   /product-categories          - Crear categoría
 * - PUT    /product-categories/:id      - Actualizar categoría
 * - DELETE /product-categories/:id      - Eliminar categoría
 * - PATCH  /product-categories/:id/status - Cambiar estado de la categoría
 * 
 * Todos requieren autenticación (JWT token)
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const { Router } = require("express");
const ctrl = require("../controllers/productCategoriesController");
const { requireAuth, requireRole } = require("../../interfaces/middlewares/authMiddleware");
const { validate, rules } = require("../../interfaces/middlewares/validationMiddleware");

const router = Router();

// Middleware: Requerir autenticación en todos los endpoints (REMOVIDO para desarrollo público)
// router.use(requireAuth);

// Rutas CRUD
router.get("/", ctrl.getProductCategories);
router.get("/:id", ctrl.getProductCategoryById);
router.post("/", ctrl.createProductCategory);
router.put("/:id", ctrl.updateProductCategory);
router.delete("/:id", ctrl.deleteProductCategory);

module.exports = router;
