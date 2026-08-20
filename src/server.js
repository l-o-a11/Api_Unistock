const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://unistock-omega.vercel.app",
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((url) => url.trim()).filter(Boolean)
    : []),
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))
        return callback(null, true);
      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

const userRoutes = require("./infrastructure/routes/userRoutes");
const authRoutes = require("./infrastructure/routes/authRoutes");
const suppliersRoutes = require("./infrastructure/routes/suppliersRoutes");
const thirdPartiesRoutes = require("./infrastructure/routes/thirdPartiesRoute");
const productionRoutes = require("./infrastructure/routes/productionRoutes");
const purchaseRoutes = require("./infrastructure/routes/purchaseRouter");
const supplyRoutes = require("./infrastructure/routes/supplyRouter");
const roleRoutes = require("./infrastructure/routes/roleRouter");
const siteRoutes = require("./infrastructure/routes/siteRoutes");
const supplyCategoryRoutes = require("./infrastructure/routes/supplyCategoryRoutes");
const moduleRoutes = require("./infrastructure/routes/moduleRoutes");
const privilegeRoutes = require("./infrastructure/routes/privilegeRoutes");
const productCategoryRoutes = require("./infrastructure/routes/productCategoryRoutes");
const productRoutes = require("./infrastructure/routes/productRoutes");
const clientRoutes = require("./infrastructure/routes/clientRoutes");
const calendarRoutes = require("./infrastructure/routes/calendarRoutes");
const uploadRoutes = require("./infrastructure/routes/uploadRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/proveedores", suppliersRoutes);
app.use("/api/terceros", thirdPartiesRoutes);
app.use("/api/produccion", productionRoutes);
app.use("/api/compras", purchaseRoutes);
app.use("/api/insumos", supplyRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/categorias-insumos", supplyCategoryRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/privileges", privilegeRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/products-categories", productCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api", uploadRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Unistock API funcionando" });
});

module.exports = app;
