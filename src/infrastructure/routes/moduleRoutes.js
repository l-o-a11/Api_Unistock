// infrastructure/routes/moduleRoutes.js

const express = require("express");
const { getModules } = require("../controllers/moduleController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.get("/", getModules);

module.exports = router;
