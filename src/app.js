require("dotenv").config();

const {
  connectDatabase,
  isDbConnected
} = require("./Config/database");

const {
  seedModulesAndPrivileges
} = require("./Config/seedModulesPrivileges");

const app = require("./interfaces/server");

const PORT = process.env.PORT || 3000;

// ==========================================================
// DETECTAR ENTORNO
// ==========================================================

const isVercel = !!process.env.VERCEL;
const isRender = !!process.env.RENDER;

console.log("==========================================");
console.log("🚀 UniStock API");
console.log("Vercel:", isVercel);
console.log("Render:", isRender);
console.log("PORT:", PORT);
console.log("==========================================");


// ==========================================================
// VERCEL - SERVERLESS
// ==========================================================

if (isVercel) {

  const serverless = require("serverless-http");

  connectDatabase()
    .then(() => seedModulesAndPrivileges())
    .catch((err) => {
      console.error(
        "[mongo] Error de conexión en Vercel:",
        err?.message || err
      );
    });

  module.exports = serverless(app);
  module.exports.app = app;


// ==========================================================
// RENDER / LOCAL
// ==========================================================

} else {

  const startServer = async (dbConnected = true) => {

    // ------------------------------------------------------
    // Seeder
    // ------------------------------------------------------

    if (dbConnected) {

      try {

        await seedModulesAndPrivileges();

      } catch (seedErr) {

        console.warn(
          "[seed] No se pudo ejecutar el seeder:",
          seedErr?.message
        );

      }

    }


    // ------------------------------------------------------
    // Iniciar Express
    // ------------------------------------------------------

    app.listen(PORT, "0.0.0.0", () => {

      if (isRender) {

        console.log(
          `🚀 Unistock API ejecutándose en Render`
        );

        console.log(
          `📡 Puerto: ${PORT}`
        );

      } else if (dbConnected) {

        console.log(
          `🖥️ Unistock API local → http://localhost:${PORT}`
        );

      } else {

        console.warn(
          `⚠️ Unistock API arrancó SIN base de datos → puerto ${PORT}`
        );

      }

    });

  };


  // ========================================================
  // CONECTAR MONGODB Y ARRANCAR SERVIDOR
  // ========================================================

  connectDatabase()

    .then(() => startServer(true))

    .catch((err) => {

      console.error(
        `[mongo] Error de conexión: ${err?.message || err}\n` +
        `→ Revisa MONGO_URI y la configuración de MongoDB Atlas.`
      );

      process.exit(1);

    });

}