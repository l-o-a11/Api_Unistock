const { Router } = require("express");
const ctrl = require("../controllers/userController");
const {
  validate,
  rules,
} = require("../../interfaces/middlewares/validationMiddleware");

const router = Router();

router.post("/login", rules.login, validate, ctrl.login);
router.post("/prepare-welcome", ctrl.prepareWelcome);

module.exports = router;