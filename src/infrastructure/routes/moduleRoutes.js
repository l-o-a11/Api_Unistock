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
const { requireAuth, requirePermission } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();
const MODULO = "roles"; // el catálogo de módulos alimenta la pantalla de gestión de roles

router.use(requireAuth);

router.get("/", requirePermission(MODULO, "leer"), ctrl.getModules);
router.get("/:id", requirePermission(MODULO, "leer"), ctrl.getModuleById);
router.post("/", requirePermission(MODULO, "crear"), ctrl.createModule);
router.put("/:id", requirePermission(MODULO, "actualizar"), ctrl.updateModule);
router.delete("/:id", requirePermission(MODULO, "eliminar"), ctrl.deleteModule);

module.exports = router;