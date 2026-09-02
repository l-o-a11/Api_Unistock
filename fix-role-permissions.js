require("dotenv").config();
const mongoose = require("mongoose");
const ModuleModel = require("./src/infrastructure/db/ModuleModel");
const PrivilegeModel = require("./src/infrastructure/db/PrivilegeModel");
const RoleModel = require("./src/infrastructure/db/RoleModel");

const normalize = (value) => String(value).trim().toLowerCase();

const connect = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("Falta MONGO_URI/MONGODB_URI en el .env");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("✅ Conectado a MongoDB");
};

const ensureSeed = async () => {
  const modules = await ModuleModel.find();
  const privileges = await PrivilegeModel.find();

  const defaultModules = [
    "usuarios", "dashboard", "empleados", "roles", "compras", "insumos",
    "categorias de insumos", "produccion", "proveedores", "terceros",
    "sedes", "productos", "categorias de productos",
  ];
  const defaultPrivileges = ["crear", "leer", "actualizar", "eliminar"];

  for (const nombre of defaultModules) {
    const exists = await ModuleModel.findOne({ nombre });
    if (!exists) await ModuleModel.create({ nombre, estado: true });
  }

  for (const nombre of defaultPrivileges) {
    const exists = await PrivilegeModel.findOne({ nombre });
    if (!exists) await PrivilegeModel.create({ nombre, estado: true });
  }

  return await Promise.all([ModuleModel.find(), PrivilegeModel.find()]);
};

const fixRole = async (roleName = "Administrador") => {
  await connect();
  const [modules, privileges] = await ensureSeed();

  const role = await RoleModel.findOne({ nombre: roleName });
  if (!role) {
    console.error(`❌ No se encontró el rol "${roleName}"`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const permisos = modules.map((mod) => ({
    modulo: normalize(mod.nombre),
    privilegios: privileges.map((p) => normalize(p.nombre)),
  }));

  role.permisos = permisos;
  await role.save();

  console.log(`✅ Rol "${roleName}" actualizado con ${permisos.length} módulos x ${privileges.length} privilegios`);
  console.log("Permisos:", JSON.stringify(permisos, null, 2));

  await mongoose.disconnect();
};

const name = process.argv[2] || "Administrador";
fixRole(name).catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
