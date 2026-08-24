// infrastructure/routes/siteRoutes.js
//
//  GET    /api/sites                — Lista con filtros + paginación
//    ?search=    busca en nombre, ciudad, barrio, direccion
//    ?estado=    "true" | "false"
//    ?page=      número de página (default 1)
//    ?limit=     registros por página (default 10, max 100)
//    ?sortBy=    campo (default "nombre")
//    ?order=     "asc" | "desc"
//
//  GET    /api/sites/:id            — Detalle de una sede
//  POST   /api/sites                — Crear sede
//  PUT    /api/sites/:id            — Actualizar sede
//  DELETE /api/sites/:id            — Eliminar sede
//  PATCH  /api/sites/:id/toggle     — Activar / Inactivar

const { Router } = require("express");
const ctrl = require("../controllers/siteController");
const { requireAuth, requirePermission } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();
const MODULO = "sedes";

router.use(requireAuth);

router.get("/", requirePermission(MODULO, "leer"), ctrl.getSites);
router.get("/:id", requirePermission(MODULO, "leer"), ctrl.getSiteById);
router.post("/", requirePermission(MODULO, "crear"), ctrl.createSite);
router.put("/:id", requirePermission(MODULO, "actualizar"), ctrl.updateSite);
router.delete("/:id", requirePermission(MODULO, "eliminar"), ctrl.deleteSite);
router.patch("/:id/toggle", requirePermission(MODULO, "actualizar"), ctrl.toggleSite);

module.exports = router;