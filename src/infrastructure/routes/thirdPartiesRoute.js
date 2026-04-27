/**
 * thirdPartiesRoute.js
 * 
 * Define las rutas para la gestión de Terceros.
 * 
 * Endpoints:
 * - GET    /terceros          - Listar terceros
 * - GET    /terceros/:id      - Obtener tercero
 * - POST   /terceros          - Crear tercero
 * - PUT    /terceros/:id      - Actualizar tercero
 * - DELETE /terceros/:id      - Eliminar tercero
 * 
 * @author Unistock Team
 */

const { Router } = require("express");
const ctrl = require("../controllers/thirdPartiesController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();

router.use(requireAuth);

router.get("/", ctrl.getThirdParties);
router.get("/:id", ctrl.getThirdPartyById);
router.post("/", ctrl.createThirdParty);
router.put("/:id", ctrl.updateThirdParty);
router.delete("/:id", ctrl.deleteThirdParty);

module.exports = router;
