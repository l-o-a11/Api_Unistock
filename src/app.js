require("dotenv").config();
const { connectDatabase } = require("./Config/database");
const { seedModulesAndPrivileges } = require("./Config/seedModulesPrivileges");
const app = require("./interfaces/server");
const PORT = process.env.PORT || 3000;

connectDatabase()
  .then(async () => {
    // Sembrar módulos y privilegios base si no existen
    await seedModulesAndPrivileges();

    app.listen(PORT, () => {
      console.log(`Unistock API  →  http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("No se pudo iniciar la API:", error.message);
    process.exit(1);
  });
