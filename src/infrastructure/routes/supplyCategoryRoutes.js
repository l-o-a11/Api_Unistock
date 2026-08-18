// infrastructure/routes/supplyCategoryRoutes.js

const express = require("express");
const {
  getSupplyCategories,
  getSupplyCategoryById,
  createSupplyCategory,
  updateSupplyCategory,
  deleteSupplyCategory,
} = require("../controllers/supplyCategoryController");
const { requireAuth, requirePermission } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();
const MODULO = "categorias de insumos";

// Todas las rutas requieren autenticación
router.use(requireAuth);

// GET /categorias-insumos - Obtener todas las categorías de insumos
router.get("/", requirePermission(MODULO, "leer"), getSupplyCategories);

// GET /categorias-insumos/:id - Obtener una categoría por ID
router.get("/:id", requirePermission(MODULO, "leer"), getSupplyCategoryById);

// POST /categorias-insumos - Crear una nueva categoría
router.post("/", requirePermission(MODULO, "crear"), createSupplyCategory);

// PUT /categorias-insumos/:id - Actualizar una categoría
router.put("/:id", requirePermission(MODULO, "actualizar"), updateSupplyCategory);

// DELETE /categorias-insumos/:id - Eliminar una categoría (soft delete)
router.delete("/:id", requirePermission(MODULO, "eliminar"), deleteSupplyCategory);

module.exports = router;