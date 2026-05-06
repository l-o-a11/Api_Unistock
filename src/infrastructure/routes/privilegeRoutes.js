// infrastructure/routes/privilegeRoutes.js

const express = require("express");
const { getPrivileges } = require("../controllers/privilegeController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.get("/", getPrivileges);

module.exports = router;
