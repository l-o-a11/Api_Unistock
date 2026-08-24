/**
 * privilegeRoutes.js
 *
 * Endpoints:
 * - GET    /privileges       - Listar privilegios
 * - GET    /privileges/:id   - Obtener privilegio por ID
 * - POST   /privileges       - Crear privilegio
 * - PUT    /privileges/:id   - Actualizar privilegio
 * - DELETE /privileges/:id   - Eliminar privilegio
 */

const express = require("express");
const ctrl = require("../controllers/privilegeController");
const { requireAuth, requirePermission } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();
const MODULO = "roles"; // el catálogo de privilegios alimenta la pantalla de gestión de roles

router.use(requireAuth);

router.get("/", requirePermission(MODULO, "leer"), ctrl.getPrivileges);
router.get("/:id", requirePermission(MODULO, "leer"), ctrl.getPrivilegeById);
router.post("/", requirePermission(MODULO, "crear"), ctrl.createPrivilege);
router.put("/:id", requirePermission(MODULO, "actualizar"), ctrl.updatePrivilege);
router.delete("/:id", requirePermission(MODULO, "eliminar"), ctrl.deletePrivilege);

module.exports = router;