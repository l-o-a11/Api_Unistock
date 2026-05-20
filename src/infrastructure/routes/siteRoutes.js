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

const { Router }      = require("express");
const ctrl            = require("../controllers/siteController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();

router.use(requireAuth);

router.get("/",                ctrl.getSites);
router.get("/:id",             ctrl.getSiteById);
router.post("/",               ctrl.createSite);
router.put("/:id",             ctrl.updateSite);
router.delete("/:id",          ctrl.deleteSite);
router.patch("/:id/toggle",    ctrl.toggleSite);

module.exports = router;
