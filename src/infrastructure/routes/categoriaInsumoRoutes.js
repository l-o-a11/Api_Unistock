// infrastructure/routes/categoriaInsumoRoutes.js

const express = require("express");
const {
  getCategoriasInsumos,
  getCategoriaInsumoById,
  createCategoriaInsumo,
  updateCategoriaInsumo,
  deleteCategoriaInsumo,
} = require("../controllers/categoriaInsumoController");
const { authMiddleware } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /categorias-insumos - Obtener todas las categorías de insumos
router.get("/", getCategoriasInsumos);

// GET /categorias-insumos/:id - Obtener una categoría por ID
router.get("/:id", getCategoriaInsumoById);

// POST /categorias-insumos - Crear una nueva categoría
router.post("/", createCategoriaInsumo);

// PUT /categorias-insumos/:id - Actualizar una categoría
router.put("/:id", updateCategoriaInsumo);

// DELETE /categorias-insumos/:id - Eliminar una categoría (soft delete)
router.delete("/:id", deleteCategoriaInsumo);

module.exports = router;