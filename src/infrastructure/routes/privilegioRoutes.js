// infrastructure/routes/privilegioRoutes.js

const express = require("express");
const { getPrivilegios } = require("../controllers/privilegioController");
const { authMiddleware } = require("../../interfaces/middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getPrivilegios);

module.exports = router;
