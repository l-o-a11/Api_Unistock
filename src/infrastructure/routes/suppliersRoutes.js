const { Router } = require("express");
const ctrl = require("../controllers/suppliersController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();
router.use(requireAuth);

router.get("/", ctrl.getSuppliers);
router.get("/:id/has-purchases", ctrl.checkSupplierHasPurchases); // ✅ NUEVO — antes de /:id
router.get("/:id", ctrl.getSupplierById);
router.post("/", ctrl.createSupplier);
router.put("/:id", ctrl.updateSupplier);
router.delete("/:id", ctrl.deleteSupplier);
router.patch("/:id/toggle", ctrl.toggleSupplier); // ← NUEVO

module.exports = router;