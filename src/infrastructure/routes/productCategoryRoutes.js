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
const { requireAuth, requirePermission } = require("../../interfaces/middlewares/authMiddleware");
const { validate, rules } = require("../../interfaces/middlewares/validationMiddleware");

const router = Router();
const MODULO = "categorias de productos";

// Middleware: Requerir autenticación en todos los endpoints
router.use(requireAuth);

// Rutas CRUD
router.get("/", requirePermission(MODULO, "leer"), ctrl.getProductCategories);
router.get("/:id", requirePermission(MODULO, "leer"), ctrl.getProductCategoryById);
router.post("/", requirePermission(MODULO, "crear"), ctrl.createProductCategory);
router.put("/:id", requirePermission(MODULO, "actualizar"), ctrl.updateProductCategory);
router.delete("/:id", requirePermission(MODULO, "eliminar"), ctrl.deleteProductCategory);

module.exports = router;