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
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();
router.use(requireAuth);

router.get("/",      ctrl.getPrivileges);
router.get("/:id",   ctrl.getPrivilegeById);
router.post("/",     ctrl.createPrivilege);
router.put("/:id",   ctrl.updatePrivilege);
router.delete("/:id",ctrl.deletePrivilege);

module.exports = router;
