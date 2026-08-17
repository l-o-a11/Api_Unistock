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
const calendarRoutes = require("../infrastructure/routes/calendarRoutes");
const uploadRoutes = require("../infrastructure/routes/uploadRoutes");

const { specs, swaggerUi } = require("../swagger/swagger");
const { isDbConnected } = require("../Config/database");

const app = express();


// ==========================================================
// CACHE PARA CATÁLOGOS
// ==========================================================

const cacheableCatalogPaths = new Set([
  "/api/products",
  "/api/insumos",
  "/api/suppliers",
  "/api/proveedores",
  "/api/sites",
  "/api/categorias-insumos",
  "/api/product-categories",
  "/api/products-categories",
]);

app.use((req, res, next) => {
  if (
    req.method === "GET" &&
    cacheableCatalogPaths.has(req.path)
  ) {
    res.set(
      "Cache-Control",
      "private, max-age=30, stale-while-revalidate=60"
    );
  }

  next();
});


// ==========================================================
// CORS
// ==========================================================

const allowedOrigins = [
  // React local
  "http://localhost:5173",

  // Flutter Web local
  "http://localhost:5000",

  // Frontend producción
  "https://unistock-omega.vercel.app",

  // Orígenes adicionales configurados en Render/.env
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
    : []),

  ...(process.env.MOBILE_ORIGINS
    ? process.env.MOBILE_ORIGINS
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
    : []),
];

const corsOptions = {
  origin: function (origin, callback) {

    // Permitir peticiones sin Origin.
    // Ejemplo: Postman, curl o algunas peticiones internas.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(
      `[CORS] Origin no permitido: ${origin}`
    );

    return callback(
      new Error(`Origen no permitido por CORS: ${origin}`)
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(cors(corsOptions));


// ==========================================================
// BODY PARSER
// ==========================================================

app.use(
  express.json({
    limit: "25mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "25mb",
  })
);


// ==========================================================
// VERIFICAR CONEXIÓN A MONGODB
// ==========================================================

// Fail-fast si MongoDB no está conectado.
// Evita que Mongoose entre en modo buffering y genere timeouts.

app.use((req, res, next) => {

  if (!isDbConnected()) {
    return res.status(503).json({
      success: false,
      message: "MongoDB no está disponible",
    });
  }

  next();
});


// ==========================================================
// RUTAS
// ==========================================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/suppliers", suppliersRoutes);

// Alias usado por el frontend
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


// ==========================================================
// UPLOAD
// ==========================================================

app.use("/api/upload", uploadRoutes);


// ==========================================================
// SWAGGER
// ==========================================================

app.get(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
    },
  })
);


// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
  });
});


// ==========================================================
// 404
// ==========================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.path} no encontrada`,
  });
});


// ==========================================================
// ERROR HANDLER GLOBAL
// ==========================================================

app.use((err, req, res, next) => {

  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message:
        "El archivo es demasiado grande. Usa imágenes de máximo 5MB.",
    });
  }

  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
});


module.exports = app;