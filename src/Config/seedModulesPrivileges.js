/**
 * seedModulesPrivileges.js
 *
 * Siembra los módulos y privilegios base en la BD si aún no existen.
 * Se llama automáticamente al iniciar la app (en app.js).
 *
 * Módulos: corresponden a las rutas del sistema (insumos, compras, etc.)
 * Privilegios: acciones posibles (crear, leer, actualizar, eliminar)
 */

const ModuleModel  = require("../infrastructure/db/ModuleModel");
const PrivilegeModel = require("../infrastructure/db/PrivilegeModel");

const DEFAULT_MODULES = [
  "usuarios",
  "roles",
  "insumos",
  "categoriasInsumos",
  "compras",
  "produccion",
  "proveedores",
  "terceros",
  "sedes",
  "productos",
  "categoriasProductos",
];

const DEFAULT_PRIVILEGES = [
  "crear",
  "leer",
  "actualizar",
  "eliminar",
];

async function seedModulesAndPrivileges() {
  try {
    // Seed módulos
    for (const nombre of DEFAULT_MODULES) {
      const exists = await ModuleModel.findOne({ nombre });
      if (!exists) {
        await ModuleModel.create({ nombre, estado: true });
        console.log(`[seed] Módulo creado: ${nombre}`);
      }
    }

    // Seed privilegios
    for (const nombre of DEFAULT_PRIVILEGES) {
      const exists = await PrivilegeModel.findOne({ nombre });
      if (!exists) {
        await PrivilegeModel.create({ nombre, estado: true });
        console.log(`[seed] Privilegio creado: ${nombre}`);
      }
    }

    console.log("[seed] Módulos y privilegios verificados ✓");
  } catch (err) {
    console.error("[seed] Error al sembrar módulos/privilegios:", err.message);
  }
}

if (require.main === module) {
  const mongoose = require("mongoose");
  const { connectDatabase } = require("./database");

  connectDatabase()
    .then(seedModulesAndPrivileges)
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error("[seed] Error:", err.message);
      process.exit(1);
    });
}

module.exports = { seedModulesAndPrivileges };
