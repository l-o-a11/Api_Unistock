const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://unistock-omega.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `Origen no permitido por CORS: ${origin}`
        )
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ],

    credentials: true
  })
);

app.use(
  express.json({
    limit: "10mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb"
  })
);


// RUTAS

app.use(
  "/api/auth",
  require("./infrastructure/routes/authRoutes")
);

app.use(
  "/api/users",
  require("./infrastructure/routes/userRoutes")
);

app.use(
  "/api/suppliers",
  require("./infrastructure/routes/suppliersRoutes")
);

app.use(
  "/api/third-parties",
  require("./infrastructure/routes/thirdPartiesRoute")
);

app.use(
  "/api/production",
  require("./infrastructure/routes/productionRoutes")
);

app.use(
  "/api/sites",
  require("./infrastructure/routes/siteRoutes")
);

app.use(
  "/api/roles",
  require("./infrastructure/routes/roleRoutes")
);

app.use(
  "/api/products",
  require("./infrastructure/routes/productRoutes")
);

app.use(
  "/api/insumos",
  require("./infrastructure/routes/supplyRoutes")
);

app.use(
  "/api/categorias-insumos",
  require("./infrastructure/routes/supplyCategoryRoutes")
);


app.get("/", (req, res) => {
  res.json({
    message: "Unistock API funcionando"
  });
});

module.exports = app;