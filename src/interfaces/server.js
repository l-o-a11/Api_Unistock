// interfaces/server.js
// Configura y exporta la app Express.
// El punto de entrada (app.js) es quien llama connectDatabase() y escucha el puerto.

const express = require("express");
const cors = require("cors");
const userRoutes = require("../infrastructure/routes/userRoutes");
const authRoutes = require("../infrastructure/routes/authRoutes");
const suppliersRoutes = require("../infrastructure/routes/suppliersRoutes");
const thirdPartiesRoutes = require("../infrastructure/routes/thirdPartiesRoute");
const productionRoutes = require("../infrastructure/routes/productionRoutes");
const compraRoutes = require("../infrastructure/routes/compraRouter");
const insumoRoutes = require("../infrastructure/routes/insumoRouter");
const rolRoutes = require("../infrastructure/routes/rolRouter");
const sedeRoutes = require("../infrastructure/routes/sedeRoutes");
const categoriaInsumoRoutes = require("../infrastructure/routes/categoriaInsumoRoutes");
const moduloRoutes = require("../infrastructure/routes/moduloRoutes");
const privilegioRoutes = require("../infrastructure/routes/privilegioRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/proveedores", suppliersRoutes);
app.use("/terceros", thirdPartiesRoutes);
app.use("/produccion", productionRoutes);
app.use('/compras', purchaseRoutes);
app.use('/insumos', insumoRoutes);
app.use('/roles', roleRoutes);
app.use('/sedes', sedeRoutes);
app.use('/categorias-insumos', categoriaInsumoRoutes);
app.use('/modulos', moduloRoutes);
app.use('/privilegios', privilegioRoutes);

// Health check
app.get("/health", (_, res) =>
  res.json({ status: "ok", timestamp: new Date() }),
);

// 404
app.use((req, res) =>
  res
    .status(404)
    .json({ success: false, message: `Ruta ${req.path} no encontrada` }),
);

// Error handler global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ success: false, message: "Error interno del servidor" });
});

module.exports = app;