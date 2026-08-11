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
const clientRoutes = require("../infrastructure/routes/clientRoutes");
const { specs, swaggerUi } = require("../swagger/swagger");

const app = express();

// Middleware: fail-fast si MongoDB no está conectado.
// Evita que Mongoose entre en modo "buffering" y luego haga timeout.
const { isDbConnected } = require("../Config/database");
app.use((req, res, next) => {
  if (!isDbConnected()) {
    return res
      .status(503)
      .json({ success: false, message: "MongoDB no está disponible" });
  }
  next();
});

// CORS Configuration
// Se aceptan: el frontend web, el emulador Android (10.0.2.2) y cualquier
// dispositivo físico en red local.  En producción ajusta FRONTEND_URL y
// MOBILE_URL en el .env en lugar de usar allowAll.
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  // Emulador Android redirige 10.0.2.2 → host de la PC
  "http://10.0.2.2:3000",
  // Dispositivos físicos en red local (ajusta la IP de tu PC si es fija)
  ...(process.env.MOBILE_ORIGINS ? process.env.MOBILE_ORIGINS.split(",") : []),
];

const corsOptions = {
  // FIX: antes la lista de origins permitidos estaba fija (5173, 5000), lo
  // que rompía CORS cada vez que Flutter Web asignaba un puerto aleatorio
  // (flutter run -d chrome sin --web-port). Ahora, en desarrollo, se acepta
  // cualquier http://localhost:<puerto>. En producción (NODE_ENV=production)
  // se sigue exigiendo que el origin esté en allowedOrigins/FRONTEND_URL.
  origin: (origin, callback) => {
    // Sin header Origin: apps nativas (Flutter mobile), Postman, curl, etc.
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV !== "production" && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`Origin no permitido por CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/suppliers", suppliersRoutes);
// Alias usado por el frontend
app.use("/api/proveedores", suppliersRoutes);
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
app.use("/api/clients", clientRoutes);

// Swagger Documentation (después de rutas de API pero antes de 404)
app.get("/api/docs", swaggerUi.serve, swaggerUi.setup(specs, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true
  }
}));
app.use("/api/docs", swaggerUi.serve);
app.get("/api/docs", swaggerUi.setup(specs));

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
  if (err?.type === "entity.too.large") {
    return res
      .status(413)
      .json({ success: false, message: "El archivo es demasiado grande. Usa imágenes de máximo 5MB." });
  }

  console.error(err.stack);
  res
    .status(500)
    .json({ success: false, message: "Error interno del servidor" });
});

module.exports = app;