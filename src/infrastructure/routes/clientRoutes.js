const { Router } = require("express");
const ctrl = require("../controllers/clientController");
const { requireAuth, requirePermission } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();
const MODULO = "clientes";

router.use(requireAuth);

router.get("/", requirePermission(MODULO, "leer"), ctrl.listClients);
router.get("/:id", requirePermission(MODULO, "leer"), ctrl.getClientById);
router.post("/", requirePermission(MODULO, "crear"), ctrl.createClient);
router.put("/:id", requirePermission(MODULO, "actualizar"), ctrl.updateClient);
router.delete("/:id", requirePermission(MODULO, "eliminar"), ctrl.deleteClient);

module.exports = router;
