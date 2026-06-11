/**
 * supplyController.js
 *
 * Reglas de negocio implementadas:
 *  1. No se puede crear con menos de 1 propiedad ni sin datos obligatorios.
 *  2. No se pueden duplicar insumos (mismo nombre + categoría).
 *  3. No se puede eliminar si tiene registros en materiales de ficha técnica.
 *  4. No se puede eliminar sin la contraseña del gerente.
 *  5. No se puede cambiar de estado si tiene registros asociados.
 *  6. El valor de cada propiedad se normaliza: mayúscula inicial, resto minúscula.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SupplyRepository = require("../repositories/SupplyRepository");
const SupplyCategoryRepository = require("../repositories/SupplyCategoryRepository");
const MaterialTechnicalSpecificationsRepository = require("../repositories/MaterialTechnicalSpecificationsRepository");
const UserRepository = require("../repositories/UserRepository");

const {
  ok,
  created,
  badRequest,
  notFound,
  serverError,
  conflict,
  forbidden,
} = require("../../shared/utils/response");

const repo = new SupplyRepository();
const categoryRepo = new SupplyCategoryRepository();
const materialRepo = new MaterialTechnicalSpecificationsRepository();
const userRepo = new UserRepository();

// ── Catálogos estáticos ───────────────────────────────────────────────────────

const MEDIDAS_PREDETERMINADAS = [
  { valor: "kg", label: "Kilogramo" },
  { valor: "g", label: "Gramo" },
  { valor: "mg", label: "Miligramo" },
  { valor: "l", label: "Litro" },
  { valor: "ml", label: "Mililitro" },
  { valor: "m", label: "Metro" },
  { valor: "cm", label: "Centímetro" },
  { valor: "mm", label: "Milímetro" },
  { valor: "m2", label: "Metro cuadrado" },
  { valor: "m3", label: "Metro cúbico" },
  { valor: "und", label: "Unidad" },
  { valor: "par", label: "Par" },
  { valor: "cja", label: "Caja" },
  { valor: "rl", label: "Rollo" },
  { valor: "blt", label: "Bulto" },
];

const PROPIEDADES_PREDETERMINADAS = [
  { clave: "color", label: "Color" },
  { clave: "material", label: "Material" },
  { clave: "marca", label: "Marca" },
  { clave: "referencia", label: "Referencia" },
  { clave: "peso", label: "Peso" },
  { clave: "dimensiones", label: "Dimensiones" },
  { clave: "proveedor", label: "Proveedor" },
  { clave: "lote", label: "Lote" },
  { clave: "vencimiento", label: "Fecha de vencimiento" },
  { clave: "observaciones", label: "Observaciones" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normaliza el valor de una propiedad:
 * primera letra mayúscula, resto minúsculas.
 * Ej: "ROJO" → "Rojo" | "algodón pima" → "Algodón pima"
 */
const normalizePropertyValue = (valor) => {
  if (typeof valor !== "string" || valor.trim() === "") return valor;
  const v = valor.trim();
  return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
};

/**
 * Aplica normalizePropertyValue a cada propiedad del array.
 */
const normalizeProperties = (propiedades = []) =>
  propiedades.map((p) => ({
    ...p,
    valor: normalizePropertyValue(p.valor),
  }));

/**
 * Verifica si el insumo tiene registros en materiales de ficha técnica.
 * Devuelve true si hay al menos uno.
 */
const hasAssociatedMaterials = async (supplyId) => {
  const results = await materialRepo.findAll({ id_insumo: supplyId, id_insumos: supplyId });
  return Array.isArray(results) && results.length > 0;
};

const isManagerOrAdmin = (rolNombre) => {
  const role = typeof rolNombre === "string" ? rolNombre.trim().toLowerCase() : "";
  return role === "gerente" || role === "administrador";
};

const extractManagerPassword = (req) =>
  req.body?.password ||
  req.body?.managerPassword ||
  req.body?.adminPassword ||
  req.body?.data?.password ||
  req.body?.data?.managerPassword ||
  req.body?.data?.adminPassword ||
  req.query?.password ||
  req.query?.managerPassword ||
  req.query?.adminPassword ||
  req.headers["x-manager-password"] ||
  req.headers["x-admin-password"] ||
  req.headers["x-password"] ||
  req.headers.password;

/**
 * Verifica la contraseña del gerente.
 * Busca al usuario autenticado y compara su contraseña hasheada.
 * El frontend puede enviar { password: "..." } en el body, query o encabezado.
 */
const verifyManagerPassword = async (userId, plainPassword) => {
  if (plainPassword === undefined || plainPassword === null) return false;

  const candidate = String(plainPassword).trim();
  if (!candidate) return false;

  const user = await userRepo.findById(userId);
  if (user && user.password) {
    return bcrypt.compare(candidate, user.password);
  }

  // En desarrollo el usuario puede ser un mock y no existir en la DB.
  if (process.env.NODE_ENV !== "production") {
    const fallbackPassword = process.env.DEV_ADMIN_PASSWORD || "admin123";
    return candidate === fallbackPassword;
  }

  return false;
};

// ── Catálogos ─────────────────────────────────────────────────────────────────

const getMedidas = (_req, res) => ok(res, MEDIDAS_PREDETERMINADAS);

const getPropiedades = (_req, res) => ok(res, PROPIEDADES_PREDETERMINADAS);

const getCategorias = async (_req, res) => {
  try {
    const categorias = await categoryRepo.findAll({ estado: true });
    return ok(res, categorias);
  } catch {
    return serverError(res);
  }
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

const getSupplies = async (req, res) => {
  try {
    const supplies = await repo.findAll(req.query);
    return ok(res, supplies.map((s) => s.toPublic()));
  } catch {
    return serverError(res);
  }
};

const getSupplyById = async (req, res) => {
  try {
    const supply = await repo.findById(req.params.id);
    if (!supply) return notFound(res, "Insumo no encontrado");
    return ok(res, supply.toPublic());
  } catch {
    return serverError(res);
  }
};

/**
 * POST /insumos
 *
 * Reglas:
 *  - Todos los campos obligatorios presentes.
 *  - Al menos 1 propiedad con clave, label y valor.
 *  - No duplicar (mismo nombre + categoría) → 409.
 *  - Normalizar valores de propiedades.
 */
const createSupply = async (req, res) => {
  try {
    const {
      nombre,
      categoria,
      valor_medida,
      medida,
      imagenes_Url = [],
      stock = 0,
      propiedades = [],
    } = req.body;

    // ── Validación de campos obligatorios ────────────────────────────────────
    const missing = [];
    if (!nombre?.trim()) missing.push("nombre");
    if (!categoria) missing.push("categoria");
    if (valor_medida === undefined || valor_medida === null) missing.push("valor_medida");
    if (!medida?.trim()) missing.push("medida");
    if (stock === undefined || stock === null) missing.push("stock");

    if (missing.length > 0) {
      return badRequest(
        res,
        `Campos obligatorios faltantes: ${missing.join(", ")}`,
      );
    }

    // ── Regla: al menos 1 propiedad ──────────────────────────────────────────
    if (!Array.isArray(propiedades) || propiedades.length === 0) {
      return badRequest(res, "El insumo debe tener al menos una propiedad.");
    }

    // Verificar que cada propiedad tenga clave, label y valor
    const invalidProps = propiedades.filter(
      (p) => !p.clave?.trim() || !p.label?.trim() || !p.valor?.toString().trim(),
    );
    if (invalidProps.length > 0) {
      return badRequest(
        res,
        "Cada propiedad debe tener clave, label y valor.",
      );
    }

    // ── Regla: no duplicar insumo ────────────────────────────────────────────
    const existing = await repo.findOne({
      nombre: { $regex: new RegExp(`^${nombre.trim()}$`, "i") },
      categoria: mongoose.isValidObjectId(categoria) ? new mongoose.Types.ObjectId(categoria) : categoria,
    });
    if (existing) {
      return conflict(res, "Ya existe un insumo con ese nombre en esta categoría.");
    }

    // ── Normalizar propiedades ───────────────────────────────────────────────
    const propiedadesNorm = normalizeProperties(propiedades);

    const supply = await repo.create({
      nombre: nombre.trim(),
      categoria,
      stock: Number(stock),
      valor_medida: parseFloat(valor_medida),
      medida: medida.trim(),
      estado: true,
      propiedades: propiedadesNorm,
      imagenes_Url: Array.isArray(imagenes_Url) ? imagenes_Url : [],
    });

    return created(res, supply.toPublic());
  } catch (err) {
    // El índice único del modelo también puede lanzar código 11000
    if (err.code === 11000) {
      return conflict(res, "Ya existe un insumo con ese nombre en esta categoría.");
    }
    return serverError(res, err.message);
  }
};

/**
 * PUT /insumos/:id
 *
 * Reglas:
 *  - Si se actualizan propiedades, normalizar valores.
 *  - Si se cambia nombre o categoría, verificar que no genere duplicado.
 *  - No puede dejar el insumo sin propiedades si se envía el array.
 */
const updateSupply = async (req, res) => {
  try {
    const supply = await repo.findById(req.params.id);
    if (!supply) return notFound(res, "Insumo no encontrado");

    const updates = { ...req.body };

    // ── Si se actualizan propiedades, validar y normalizar ───────────────────
    if (updates.propiedades !== undefined) {
      if (!Array.isArray(updates.propiedades) || updates.propiedades.length === 0) {
        return badRequest(res, "El insumo debe mantener al menos una propiedad.");
      }

      const invalidProps = updates.propiedades.filter(
        (p) => !p.clave?.trim() || !p.label?.trim() || !p.valor?.toString().trim(),
      );
      if (invalidProps.length > 0) {
        return badRequest(res, "Cada propiedad debe tener clave, label y valor.");
      }

      updates.propiedades = normalizeProperties(updates.propiedades);
    }

    // ── Si se cambia nombre o categoría, verificar duplicado ─────────────────
    const newNombre = updates.nombre ?? supply.nombre;
    const newCategoria = updates.categoria ?? supply.categoria?.toString();

    if (updates.nombre !== undefined || updates.categoria !== undefined) {
      const duplicate = await repo.findOne({
        _id: { $ne: supply._id ?? supply.id },
        nombre: { $regex: new RegExp(`^${newNombre.trim()}$`, "i") },
        categoria: mongoose.isValidObjectId(newCategoria)
          ? new mongoose.Types.ObjectId(newCategoria)
          : newCategoria,
      });
      if (duplicate) {
        return conflict(res, "Ya existe un insumo con ese nombre en esta categoría.");
      }
    }

    if (updates.nombre) updates.nombre = updates.nombre.trim();

    const updated = await repo.update(req.params.id, updates);
    return ok(res, updated.toPublic());
  } catch (err) {
    if (err.code === 11000) {
      return conflict(res, "Ya existe un insumo con ese nombre en esta categoría.");
    }
    return serverError(res, err.message);
  }
};

/**
 * DELETE /insumos/:id
 *
 * Reglas:
 *  - Requiere { password } en el body → verificar contraseña del gerente.
 *  - No se puede eliminar si tiene materiales en fichas técnicas asociados.
 */
const deleteSupply = async (req, res) => {
  try {
    const supply = await repo.findById(req.params.id);
    if (!supply) return notFound(res, "Insumo no encontrado");

    if (!isManagerOrAdmin(req.user?.rolNombre)) {
      return forbidden(res, "Solo gerentes o administradores pueden eliminar insumos.");
    }

    const password = extractManagerPassword(req);
    if (!password) {
      return badRequest(res, "Se requiere la contraseña del gerente para eliminar un insumo.");
    }

    const passwordOk = await verifyManagerPassword(req.user?.id, password);
    if (!passwordOk) {
      return forbidden(res, "Contraseña del gerente incorrecta.");
    }

    // ── Regla: no eliminar si tiene registros en fichas técnicas ─────────────
    const linked = await hasAssociatedMaterials(req.params.id);
    if (linked) {
      return conflict(
        res,
        "No se puede eliminar el insumo porque está referenciado en materiales de fichas técnicas.",
      );
    }

    await repo.delete(req.params.id);
    return ok(res, { message: "Insumo eliminado exitosamente." });
  } catch (err) {
    return serverError(res, err.message);
  }
};

/**
 * PATCH /insumos/:id/toggle
 *
 * Regla:
 *  - No se puede cambiar el estado si tiene registros en fichas técnicas.
 */
const toggleSupply = async (req, res) => {
  try {
    if (!isManagerOrAdmin(req.user?.rolNombre)) {
      return forbidden(res, "Solo gerentes o administradores pueden cambiar el estado del insumo.");
    }

    const supply = await repo.findById(req.params.id);
    if (!supply) return notFound(res, "Insumo no encontrado");

    const password = extractManagerPassword(req);
    if (!password) {
      return badRequest(res, "Se requiere la contraseña del gerente para cambiar el estado del insumo.");
    }

    const passwordOk = await verifyManagerPassword(req.user?.id, password);
    if (!passwordOk) {
      return forbidden(res, "Contraseña del gerente incorrecta.");
    }

    // ── Regla: bloquear toggle si tiene registros asociados ──────────────────
    const linked = await hasAssociatedMaterials(req.params.id);
    if (linked) {
      return conflict(
        res,
        "No se puede cambiar el estado del insumo porque está referenciado en materiales de fichas técnicas.",
      );
    }

    const updated = await repo.update(req.params.id, { estado: !supply.estado });
    return ok(res, updated.toPublic());
  } catch (err) {
    return serverError(res, err.message);
  }
};

module.exports = {
  getMedidas,
  getPropiedades,
  getCategorias,
  getSupplies,
  getSupplyById,
  createSupply,
  updateSupply,
  deleteSupply,
  toggleSupply,
};