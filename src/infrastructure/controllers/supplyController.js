/**
 * supplyController.js
 * 
 * Controlador para la gestión de Insumos.
 * Maneja operaciones CRUD para insumos.
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const SupplyRepository = require("../repositories/SupplyRepository");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const repo = new SupplyRepository();

const getSupplies = (req, res) => {
  try {
    const supplies = repo.findAll(req.query);
    return ok(res, supplies.map(s => s.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

const getSupplyById = (req, res) => {
  try {
    const supply = repo.findById(req.params.id);
    if (!supply) return notFound(res, "Insumo no encontrado");
    return ok(res, supply.toPublic());
  } catch (err) {
    return serverError(res);
  }
};

const createSupply = (req, res) => {
  try {
    const { nombre, categoria, valor_medida, medida, imagenes_Url, stock = 0, propiedades = [] } = req.body;
    if (!nombre || !categoria || valor_medida === undefined || !medida || !imagenes_Url || !Array.isArray(imagenes_Url) || imagenes_Url.length === 0) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const supply = repo.create({
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

const updateSupply = (req, res) => {
  try {
    const supply = repo.findById(req.params.id);
    if (!supply) return notFound(res, "Insumo no encontrado");
    const updated = repo.update(req.params.id, req.body);
    return ok(res, updated.toPublic());
  } catch (err) {
    return serverError(res);
  }
};

const deleteSupply = (req, res) => {
  try {
    const supply = repo.findById(req.params.id);
    if (!supply) return notFound(res, "Insumo no encontrado");
    repo.delete(req.params.id);
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