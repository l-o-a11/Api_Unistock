/**
 * seedModulesPrivileges.js
 *
 * Siembra los módulos y privilegios base en la BD si aún no existen.
 * Se llama automáticamente al iniciar la app (en app.js).
 */

const ModuleModel    = require("../infrastructure/db/ModuleModel");
const PrivilegeModel = require("../infrastructure/db/PrivilegeModel");
const RoleModel      = require("../infrastructure/db/RoleModel");

const DEFAULT_MODULES = [
  "usuarios",
  "dashboard",
  "empleados",
  "roles",
  "compras",
  "insumos",
  "categorias de insumos",
  "produccion",
  "proveedores",
  "terceros",
  "sedes",
  "productos",
  "categorias de productos",
  "clientes",
];

const DEFAULT_PRIVILEGES = [
  "crear",
  "leer",
  "actualizar",
  "eliminar",
];

const DEFAULT_ROLES = [
  {
    nombre: "Administrador",
    descripcion: "Acceso total a todos los módulos del sistema",
    estado: true,
    modules: DEFAULT_MODULES,
    privilegios: DEFAULT_PRIVILEGES,
  },
  {
    nombre: "Gerente",
    descripcion: "Acceso total excepto gestión de roles y usuarios",
    estado: true,
    modules: DEFAULT_MODULES.filter((m) => m !== "usuarios" && m !== "roles"),
    privilegios: DEFAULT_PRIVILEGES,
  },
  {
    nombre: "Empleado",
    descripcion: "Acceso de solo lectura a producción y dashboard",
    estado: true,
    modules: ["produccion", "dashboard"],
    privilegios: ["leer"],
  },
];

async function seedModulesAndPrivileges() {
  try {
    for (const nombre of DEFAULT_MODULES) {
      const exists = await ModuleModel.findOne({ nombre });
      if (!exists) {
        await ModuleModel.create({ nombre, estado: true });
        console.log(`[seed] Módulo creado: ${nombre}`);
      }
    }

    for (const nombre of DEFAULT_PRIVILEGES) {
      const exists = await PrivilegeModel.findOne({ nombre });
      if (!exists) {
        await PrivilegeModel.create({ nombre, estado: true });
        console.log(`[seed] Privilegio creado: ${nombre}`);
      }
    }

    for (const roleDef of DEFAULT_ROLES) {
      let role = await RoleModel.findOne({ nombre: roleDef.nombre });

      if (!role) {
        role = await RoleModel.create({
          nombre: roleDef.nombre,
          descripcion: roleDef.descripcion,
          estado: roleDef.estado,
          permisos: roleDef.modules.map((modulo) => ({
            modulo,
            privilegios: roleDef.privilegios,
          })),
        });
        console.log(`[seed] Rol creado: ${roleDef.nombre} con ${roleDef.modules.length} módulos`);
      } else {
        const existingModulos = new Set((role.permisos || []).map((p) => p.modulo));
        const missing = roleDef.modules.filter((m) => !existingModulos.has(m));
        if (missing.length > 0) {
          const newPermisos = [...(role.permisos || [])];
          for (const modulo of missing) {
            newPermisos.push({ modulo, privilegios: roleDef.privilegios });
          }
          await RoleModel.findByIdAndUpdate(role._id, { permisos: newPermisos });
          console.log(`[seed] Rol ${roleDef.nombre}: agregados ${missing.length} módulos faltantes`);
        }
      }
    }

    console.log("[seed] Módulos, privilegios y roles verificados ✓");
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
