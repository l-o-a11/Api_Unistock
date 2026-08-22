const { Router } = require("express");
const ctrl = require("../controllers/suppliersController");
const { requireAuth, requirePermission } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();
const MODULO = "proveedores";

router.use(requireAuth);

router.get("/", requirePermission(MODULO, "leer"), ctrl.getSuppliers);
router.get("/:id/has-purchases", requirePermission(MODULO, "leer"), ctrl.checkSupplierHasPurchases);
router.get("/:id", requirePermission(MODULO, "leer"), ctrl.getSupplierById);
router.post("/", requirePermission(MODULO, "crear"), ctrl.createSupplier);
router.put("/:id", requirePermission(MODULO, "actualizar"), ctrl.updateSupplier);
router.delete("/:id", requirePermission(MODULO, "eliminar"), ctrl.deleteSupplier);
router.patch("/:id/toggle", requirePermission(MODULO, "actualizar"), ctrl.toggleSupplier);

module.exports = router;