// infrastructure/routes/userRoutes.js
const { Router } = require("express");
const ctrl = require("../controllers/UserController");
const {
  requireAuth,
  requireRole,
} = require("../../interfaces/middlewares/authMiddleware");
const {
  validate,
  rules,
} = require("../../interfaces/middlewares/validationMiddleware");

const router = Router();

// Todos los endpoints de usuarios requieren autenticación
router.use(requireAuth);

// Catálogos
router.get("/roles", ctrl.getRoles);
router.get("/sedes", ctrl.getSedes);

// CRUD
router.get("/", rules.listUsers, validate, ctrl.getUsers);
router.get("/:id", rules.idParam, validate, ctrl.getUserById);

router.post("/", requireRole(2), rules.createUser, validate, ctrl.createUser);

router.put("/:id", requireRole(2), rules.updateUser, validate, ctrl.updateUser);

router.patch(
  "/:id/status",
  requireRole(2),
  rules.idParam,
  validate,
  ctrl.toggleStatus,
);

router.delete("/:id", requireRole(2), rules.idParam, validate, ctrl.deleteUser);

module.exports = router;