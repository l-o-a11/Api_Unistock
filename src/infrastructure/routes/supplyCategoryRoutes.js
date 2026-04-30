// infrastructure/routes/supplyCategoryRoutes.js

const express = require("express");
const {
  getSuppliesCategories,
  getSupplyCategoryById,
  createSupplyCategory,
  updateSupplyCategory,
  deleteSupplyCategory,
} = require("../controllers/supplyCategoryController");
const { authMiddleware } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /categorias-insumos - Obtener todas las categorías de insumos
router.get("/", getSuppliesCategories);

// GET /categorias-insumos/:id - Obtener una categoría por ID
router.get("/:id", getSupplyCategoryById);

// POST /categorias-insumos - Crear una nueva categoría
router.post("/", createSupplyCategory);

// PUT /categorias-insumos/:id - Actualizar una categoría
router.put("/:id", updateSupplyCategory);

// DELETE /categorias-insumos/:id - Eliminar una categoría (soft delete)
router.delete("/:id", deleteSupplyCategory);

module.exports = router;