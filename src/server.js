require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// FIX 1: subir límite a 10mb para soportar imágenes en base64
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rutas
app.use("/api/auth",                require("./infrastructure/routes/authRoutes"));
app.use("/api/users",               require("./infrastructure/routes/userRoutes"));
app.use("/api/suppliers",           require("./infrastructure/routes/suppliersRoutes"));
app.use("/api/third-parties",       require("./infrastructure/routes/thirdPartiesRoute"));
app.use("/api/production",          require("./infrastructure/routes/productionRoutes"));
app.use("/api/sites",               require("./infrastructure/routes/siteRoutes"));
app.use("/api/roles",               require("./infrastructure/routes/roleRoutes"));
app.use("/api/products",            require("./infrastructure/routes/productRoutes"));

// FIX 2: rutas con los nombres que usa el frontend
app.use("/api/insumos",             require("./infrastructure/routes/supplyRoutes"));
app.use("/api/categorias-insumos",  require("./infrastructure/routes/supplyCategoryRoutes"));

// Health check
app.get("/", (req, res) => res.json({ message: "Unistock API funcionando" }));

module.exports = app;