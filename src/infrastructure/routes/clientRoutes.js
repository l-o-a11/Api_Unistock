const { Router } = require("express");
const ctrl = require("../controllers/clientController");

const router = Router();

router.get("/", ctrl.listClients);
router.get("/:id", ctrl.getClientById);
router.post("/", ctrl.createClient);
router.put("/:id", ctrl.updateClient);
router.delete("/:id", ctrl.deleteClient);

module.exports = router;
