require("dotenv").config();
const { connectDatabase } = require("./Config/database");
const { seedModulesAndPrivileges } = require("./Config/seedModulesPrivileges");
const app = require("./interfaces/server");
const PORT = process.env.PORT || 3000;

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
        `   Verifica la whitelist de IPs en MongoDB Atlas y la variable MONGO_URI en .env`
      );
    }
  });
};

connectDatabase()
  .then(() => startServer(true))
  .catch((err) => {
    console.error(
      `[mongo] Error de conexión: ${err?.message || err}\n` +
      `  → Revisa MONGO_URI en .env y la whitelist de IPs en MongoDB Atlas.`
    );
    startServer(false);

  });
