// infrastructure/routes/sedeRoutes.js

const express = require("express");
const {
    getSedes,
    getSedeById,
    createSede,
    updateSede,
    deleteSede,
} = require("../controllers/sedeController");
const { authMiddleware } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /sedes - Obtener todas las sedes
router.get("/", getSedes);

// GET /sedes/:id - Obtener una sede por ID
router.get("/:id", getSedeById);

// POST /sedes - Crear una nueva sede
router.post("/", createSede);

// PUT /sedes/:id - Actualizar una sede
router.put("/:id", updateSede);

// DELETE /sedes/:id - Eliminar una sede (soft delete)
router.delete("/:id", deleteSede);

module.exports = router;