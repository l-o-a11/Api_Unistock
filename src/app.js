require("dotenv").config();
const { connectDatabase, isDbConnected } = require("./Config/database");
const { seedModulesAndPrivileges } = require("./Config/seedModulesPrivileges");
const app = require("./interfaces/server");
const PORT = process.env.PORT || 3000;

// Detecta si estamos corriendo en Vercel (producción serverless)
const isVercel = !!process.env.VERCEL;

// Exporta el handler serverless para Vercel
if (isVercel) {
  const serverless = require("serverless-http");
  // Conecta a la BD al arrancar la función (en frío o warm)
  connectDatabase()
    .then(() => seedModulesAndPrivileges())
    .catch((err) => {
      console.error(
        "[mongo] Error de conexión en Vercel:",
        err?.message || err,
      );
    });
  module.exports = serverless(app);
  module.exports.app = app;
} else {
  const startServer = async (dbConnected = true) => {
    if (dbConnected) {
      // Sembrar módulos y privilegios base si no existen
      try {
        await seedModulesAndPrivileges();
      } catch (seedErr) {
        console.warn("[seed] No se pudo ejecutar el seeder:", seedErr?.message);
      }
    }

    app.listen(PORT, () => {
      if (dbConnected) {
        console.log(`Unistock API  →  http://localhost:${PORT}`);
      } else {
        console.warn(
          `⚠️  Unistock API arrancó SIN base de datos  →  http://localhost:${PORT}\n` +
            `   Las rutas que usan MongoDB devolverán 503 hasta que la conexión esté disponible.\n` +
            `   Verifica la whitelist de IPs en MongoDB Atlas y la variable MONGO_URI en .env`,
        );
      }
    });
  };

  connectDatabase()
    .then(() => startServer(true))
    .catch((err) => {
      console.error(
        `[mongo] Error de conexión: ${err?.message || err}\n` +
          `  → Revisa MONGO_URI en .env y la whitelist de IPs en MongoDB Atlas.`,
      );
      // No arrancar el servidor cuando Mongo falle para evitar timeouts de buffering.
      process.exit(1);
    });
}
