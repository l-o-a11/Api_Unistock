/**
 * moduleRoutes.js
 *
 * Endpoints:
 * - GET    /modules       - Listar módulos
 * - GET    /modules/:id   - Obtener módulo por ID
 * - POST   /modules       - Crear módulo
 * - PUT    /modules/:id   - Actualizar módulo
 * - DELETE /modules/:id   - Eliminar módulo
 */

const express = require("express");
const ctrl = require("../controllers/moduleController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();
router.use(requireAuth);

router.get("/",      ctrl.getModules);
router.get("/:id",   ctrl.getModuleById);
router.post("/",     ctrl.createModule);
router.put("/:id",   ctrl.updateModule);
router.delete("/:id",ctrl.deleteModule);

module.exports = router;
