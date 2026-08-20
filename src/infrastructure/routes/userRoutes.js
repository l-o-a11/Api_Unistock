const { Router } = require("express");
const ctrl = require("../controllers/userController");
const {
  requireAuth,
  requireRole,
} = require("../../interfaces/middlewares/authMiddleware");
const {
  validate,
  rules,
} = require("../../interfaces/middlewares/validationMiddleware");

const router = Router();

router.use(requireAuth);

// Gerente y Admin pueden ver — cada uno filtrado por su sede en el repositorio
router.get(
  "/",
  rules.listUsers,
  validate,
  requireRole("Gerente", "Administrador"),
  ctrl.getUsers,
);

// FIX (punto 1): validación en tiempo real de documento duplicado.
// DEBE ir antes de "/:id" — si no, Express interpretaría "check-document"
// como si fuera el parámetro :id de la ruta de abajo.
router.get(
  "/check-document/:numero",
  requireRole("Gerente", "Administrador"),
  ctrl.checkDocument,
);

router.get(
  "/:id",
  rules.idParam,
  validate,
  requireRole("Gerente", "Administrador"),
  ctrl.getUserById,
);

// Solo Gerente y Admin pueden crear/editar/eliminar
router.post(
  "/",
  requireRole("Gerente", "Administrador"),
  rules.createUser,
  validate,
  ctrl.createUser,
);

router.put(
  "/:id",
  requireRole("Gerente", "Administrador"),
  rules.updateUser,
  validate,
  ctrl.updateUser,
);

router.patch(
  "/:id/status",
  requireRole("Gerente", "Administrador"),
  rules.idParam,
  validate,
  ctrl.toggleStatus,
);

router.delete(
  "/:id",
  requireRole("Gerente", "Administrador"),
  rules.idParam,
  validate,
  ctrl.deleteUser,
);

module.exports = router;
