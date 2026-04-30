// infrastructure/routes/privilegioRoutes.js

const express = require("express");
const { getPrivilegios } = require("../controllers/privilegioController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.get("/", getPrivilegios);

module.exports = router;
