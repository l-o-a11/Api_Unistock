// server.js — Configura Express y exporta la app
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", require("./infrastructure/routes/authRoutes"));
app.use("/api/users", require("./infrastructure/routes/userRoutes"));
app.use("/api/suppliers", require("./infrastructure/routes/suppliersRoutes"));
app.use("/api/third-parties", require("./infrastructure/routes/thirdPartiesRoute"));
app.use("/api/production", require("./infrastructure/routes/productionRoutes"));
app.use("/api/sites", require("./infrastructure/routes/siteRoutes"));
app.use("/api/roles", require("./infrastructure/routes/roleRoutes"));
app.use("/api/products", require("./infrastructure/routes/productRoutes"));



// Health check
app.get("/", (req, res) => res.json({ message: "Unistock API funcionando " }));

module.exports = app;