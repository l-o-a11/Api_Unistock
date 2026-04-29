// infrastructure/routes/moduloRoutes.js

const express = require("express");
const { getModulos } = require("../controllers/moduloController");
const { authMiddleware } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getModulos);

module.exports = router;
