/**
 * supplyController.js
 *
 * Controller for Supply management.
 * Handles CRUD operations for supplies.
 */

const SupplyRepository = require("../repositories/SupplyRepository");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const repo = new SupplyRepository();

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
    const { nombre, categoria, valor_medida, medida, imagenes_Url, stock = 0, propiedades = [] } = req.body;
    if (!nombre || !categoria || valor_medida === undefined || !medida || !imagenes_Url || !Array.isArray(imagenes_Url) || imagenes_Url.length === 0) {
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
  getSupplies,
  getSupplyById,
  createSupply,
  updateSupply,
  deleteSupply,
};
