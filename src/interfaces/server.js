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
const purchaseRoutes = require("../infrastructure/routes/purchaseRouter");
const supplyRoutes = require("../infrastructure/routes/supplyRouter");
const roleRoutes = require("../infrastructure/routes/roleRouter");
const siteRoutes = require("../infrastructure/routes/siteRoutes");
const supplyCategoryRoutes = require("../infrastructure/routes/supplyCategoryRoutes");
const moduleRoutes = require("../infrastructure/routes/moduleRoutes");
const privilegeRoutes = require("../infrastructure/routes/privilegeRoutes");
const productCategoryRoutes = require("../infrastructure/routes/productCategoryRoutes");
const productRoutes = require("../infrastructure/routes/productRoutes");

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173", //ajusta según sea necesario esto es del fron
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/terceros", thirdPartiesRoutes);
app.use("/api/produccion", productionRoutes);
app.use('/api/compras', purchaseRoutes);
app.use('/api/insumos', supplyRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/categorias-insumos', supplyCategoryRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/privileges', privilegeRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/products-categories", productCategoryRoutes);
app.use("/api/products", productRoutes);


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
