// app.js  ← raíz del proyecto
require("dotenv").config();
const { connectDatabase } = require("./src/Config/database");
const app = require("./src/interfaces/server");
const PORT = process.env.PORT || 3000;

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀  Unistock API  →  http://localhost:${PORT}`);
    console.log(`    Login de prueba: admin@admin.com / admin123\n`);
  });
});