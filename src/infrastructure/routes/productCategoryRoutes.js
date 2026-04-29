/**
 * productCategoryRoutes.js
 * 
 * Define las rutas para la gestión de Categorías de Productos.
 * 
 * Endpoints:
 * - GET    /categorias          - Listar categorías
 * - GET    /categorias/:id      - Obtener categoría
 * - POST   /categorias          - Crear categoría
 * - PUT    /categorias/:id      - Actualizar categoría
 * - DELETE /categorias/:id      - Eliminar categoría
 * 
 * Todos requieren autenticación (JWT token)
 * 
 * @author Unistock Team
 * @version 1.0.0
 * - GET    /categorias/:id      - Obtener categoría
 * - POST   /categorias          - Crear categoría
 * - PUT    /categorias/:id      - Actualizar categoría
 * - DELETE /categorias/:id      - Eliminar categoría
 * 
 * Todos requieren autenticación (JWT token)
 * 
 * @author Unistock Team
 */

const { Router } = require("express");
const ctrl = require("../controllers/productCategoriesController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();

// Middleware: Requerir autenticación en todos los endpoints
router.use(requireAuth);

// Rutas CRUD
router.get("/", ctrl.getProductCategories);
router.get("/:id", ctrl.getProductCategoryById);
router.post("/", ctrl.createProductCategory);
router.put("/:id", ctrl.updateProductCategory);
router.delete("/:id", ctrl.deleteProductCategory);

module.exports = router;
