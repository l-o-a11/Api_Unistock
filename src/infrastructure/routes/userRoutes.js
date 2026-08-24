const { Router } = require("express");
const ctrl = require("../controllers/userController");
const {
  requireAuth,
  requirePermission,
} = require("../../interfaces/middlewares/authMiddleware");
const {
  validate,
  rules,
} = require("../../interfaces/middlewares/validationMiddleware");

const router = Router();
const MODULO = "usuarios";

router.use(requireAuth);

// Gerente y Admin pueden ver — cada uno filtrado por su sede en el repositorio
router.get(
  "/",
  rules.listUsers,
  validate,
  requirePermission(MODULO, "leer"),
  ctrl.getUsers,
);

// FIX (punto 1): validación en tiempo real de documento duplicado.
// DEBE ir antes de "/:id" — si no, Express interpretaría "check-document"
// como si fuera el parámetro :id de la ruta de abajo.
router.get(
  "/check-document/:numero",
  requirePermission(MODULO, "leer"),
  ctrl.checkDocument,
);

router.get(
  "/:id",
  rules.idParam,
  validate,
  requirePermission(MODULO, "leer"),
  ctrl.getUserById,
);

// Solo Gerente y Admin pueden crear/editar/eliminar
router.post(
  "/",
  requirePermission(MODULO, "crear"),
  rules.createUser,
  validate,
  ctrl.createUser,
);

router.put(
  "/:id",
  requirePermission(MODULO, "actualizar"),
  rules.updateUser,
  validate,
  ctrl.updateUser,
);

router.patch(
  "/:id/status",
  requirePermission(MODULO, "actualizar"),
  rules.idParam,
  validate,
  ctrl.toggleStatus,
);

router.delete(
  "/:id",
  requirePermission(MODULO, "eliminar"),
  rules.idParam,
  validate,
  ctrl.deleteUser,
);

module.exports = router;
