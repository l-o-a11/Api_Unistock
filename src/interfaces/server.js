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