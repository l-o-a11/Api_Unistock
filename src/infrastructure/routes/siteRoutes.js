// infrastructure/routes/siteRoutes.js

const express = require("express");
const {
    getSites,
    getSiteById,
    createSite,
    updateSite,
    deleteSite,
} = require("../controllers/siteController");
const { authMiddleware } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /sites - Obtener todas las sedes
router.get("/", getSites);

// GET /sites/:id - Obtener una sede por ID
router.get("/:id", getSiteById);

// POST /sites - Crear una nueva sede
router.post("/", createSite);

// PUT /sites/:id - Actualizar una sede
router.put("/:id", updateSite);

// DELETE /sites/:id - Eliminar una sede (soft delete)
router.delete("/:id", deleteSite);

module.exports = router;