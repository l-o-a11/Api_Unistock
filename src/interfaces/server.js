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
const { specs, swaggerUi } = require("../swagger/swagger");

const app = express();

// CORS Configuration
// IMPORTANTE: debe ir ANTES de cualquier otro middleware (incluido el check de MongoDB),
// para que los preflights OPTIONS reciban los headers correctos sin ser bloqueados.
//
// Se aceptan: el frontend web (5173), Flutter Web fijo en 5000, el emulador
// Android (10.0.2.2) y cualquier origen extra definido en MOBILE_ORIGINS del .env.
//
// NOTA Flutter Web: flutter run -d chrome SIN --web-port asigna un puerto
// ALEATORIO cada vez, lo que rompe esta lista. Siempre lanzar con:
//   flutter run -d chrome --web-port=5000
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5000",
  // Emulador Android redirige 10.0.2.2 → host de la PC
  "http://10.0.2.2:3000",
  // Dispositivos físicos en red local (define MOBILE_ORIGINS=ip1,ip2 en .env)
  ...(process.env.MOBILE_ORIGINS ? process.env.MOBILE_ORIGINS.split(",") : []),
];

const corsOptions = {
  origin: function (origin, callback) {
    // Sin origin → Postman, curl, apps móviles nativas: permitir
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado para origen: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Aplicar CORS a todas las rutas
app.use(cors(corsOptions));
// Responder preflights OPTIONS directamente, antes de que lleguen a requireAuth
app.options("/{*path}", cors(corsOptions));

// Body parsers
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Middleware: fail-fast si MongoDB no está conectado.
// Evita que Mongoose entre en modo "buffering" y luego haga timeout.
// Va DESPUÉS del CORS para que el 503 también lleve los headers de CORS.
const { isDbConnected } = require("../Config/database");
app.use((req, res, next) => {
  if (!isDbConnected()) {
    return res
      .status(503)
      .json({ success: false, message: "MongoDB no está disponible" });
  }
  next();
});

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