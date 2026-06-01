/**
 * supplyController.js
 *
 * Controller for Supply management.
 * Handles CRUD operations for supplies.
 */

const SupplyRepository = require("../repositories/SupplyRepository");
const SupplyCategoryRepository = require("../repositories/SupplyCategoryRepository");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const repo = new SupplyRepository();
const categoryRepo = new SupplyCategoryRepository();

// Catálogo de unidades de medida predeterminadas
const MEDIDAS_PREDETERMINADAS = [
  { valor: "kg",  label: "Kilogramo" },
  { valor: "g",   label: "Gramo" },
  { valor: "mg",  label: "Miligramo" },
  { valor: "l",   label: "Litro" },
  { valor: "ml",  label: "Mililitro" },
  { valor: "m",   label: "Metro" },
  { valor: "cm",  label: "Centímetro" },
  { valor: "mm",  label: "Milímetro" },
  { valor: "m2",  label: "Metro cuadrado" },
  { valor: "m3",  label: "Metro cúbico" },
  { valor: "und", label: "Unidad" },
  { valor: "par", label: "Par" },
  { valor: "cja", label: "Caja" },
  { valor: "rl",  label: "Rollo" },
  { valor: "blt", label: "Bulto" },
];

// Catálogo de propiedades predeterminadas
const PROPIEDADES_PREDETERMINADAS = [
  { clave: "color",     label: "Color" },
  { clave: "material",  label: "Material" },
  { clave: "marca",     label: "Marca" },
  { clave: "referencia",label: "Referencia" },
  { clave: "peso",      label: "Peso" },
  { clave: "dimensiones",label: "Dimensiones" },
  { clave: "proveedor", label: "Proveedor" },
  { clave: "lote",      label: "Lote" },
  { clave: "vencimiento",label: "Fecha de vencimiento" },
  { clave: "observaciones", label: "Observaciones" },
];

// ── Catálogos ─────────────────────────────────────────────────────────────────

const getMedidas = (req, res) => {
  return ok(res, MEDIDAS_PREDETERMINADAS);
};

const getPropiedades = (req, res) => {
  return ok(res, PROPIEDADES_PREDETERMINADAS);
};

const getCategorias = async (req, res) => {
  try {
    const categorias = await categoryRepo.findAll({ estado: true });
    return ok(res, categorias);
  } catch (err) {
    return serverError(res);
  }
};

const getSupplies = async (req, res) => {
  try {
    const supplies = await repo.findAll(req.query);
    return ok(res, supplies.map((s) => s.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

const getSupplyById = async (req, res) => {
  try {
    const supply = await repo.findById(req.params.id);
    if (!supply) return notFound(res, "Insumo no encontrado");
    return ok(res, supply.toPublic());
  } catch (err) {
    return serverError(res);
  }
};

const createSupply = async (req, res) => {
  try {
    const { 
      nombre, 
      categoria, 
      valor_medida, 
      medida, 
      imagenes_Url = [], 
      stock = 0, 
      propiedades = [] } = req.body;
      
    if (!nombre || !categoria || valor_medida === undefined || !medida === undefined || stock === undefined) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const supply = await repo.create({
      nombre,
      categoria,
      stock,
      valor_medida: parseFloat(valor_medida),
      medida,
      estado: true,
      propiedades,
      imagenes_Url,
    });
    return created(res, supply.toPublic());
  } catch (err) {
    return serverError(res);
  }
};

const updateSupply = async (req, res) => {
  try {
    const supply = await repo.findById(req.params.id);
    if (!supply) return notFound(res, "Insumo no encontrado");
    const updated = await repo.update(req.params.id, req.body);
    return ok(res, updated.toPublic());
  } catch (err) {
    return serverError(res);
  }
};

const deleteSupply = async (req, res) => {
  try {
    const supply = await repo.findById(req.params.id);
    if (!supply) return notFound(res, "Insumo no encontrado");
    await repo.delete(req.params.id);
    return ok(res, { message: "Insumo eliminado exitosamente" });
  } catch (err) {
    return serverError(res);
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
};
