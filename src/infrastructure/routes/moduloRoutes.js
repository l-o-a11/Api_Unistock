// infrastructure/routes/moduloRoutes.js

const express = require("express");
const { getModulos } = require("../controllers/moduloController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.get("/", getModulos);

module.exports = router;
