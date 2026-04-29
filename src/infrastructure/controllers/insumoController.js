/**
 * insumoController.js
 * 
 * Controlador para la gestión de Insumos.
 * Maneja operaciones CRUD para insumos.
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const InsumoRepository = require("../repositories/InsumoRepository");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const repo = new InsumoRepository();

const getInsumos = (req, res) => {
  try {
    const insumos = repo.findAll(req.query);
    return ok(res, insumos.map(i => i.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

const getInsumoById = (req, res) => {
  try {
    const insumo = repo.findById(req.params.id);
    if (!insumo) return notFound(res, "Insumo no encontrado");
    return ok(res, insumo.toPublic());
  } catch (err) {
    return serverError(res);
  }
};

const createInsumo = (req, res) => {
  try {
    const { nombre, categoria, valor_medida, medida, stock = 0, propiedades = [] } = req.body;
    if (!nombre || !categoria || valor_medida === undefined || !medida) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const insumo = repo.create({
      nombre,
      categoria,
      stock,
      valor_medida: parseFloat(valor_medida),
      medida,
      estado: true,
      propiedades,
    });
    return created(res, insumo.toPublic());
  } catch (err) {
    return serverError(res);
  }
};

const updateInsumo = (req, res) => {
  try {
    const insumo = repo.findById(req.params.id);
    if (!insumo) return notFound(res, "Insumo no encontrado");
    const updated = repo.update(req.params.id, req.body);
    return ok(res, updated.toPublic());
  } catch (err) {
    return serverError(res);
  }
};

const deleteInsumo = (req, res) => {
  try {
    const insumo = repo.findById(req.params.id);
    if (!insumo) return notFound(res, "Insumo no encontrado");
    repo.delete(req.params.id);
    return ok(res, { message: "Insumo eliminado exitosamente" });
  } catch (err) {
    return serverError(res);
  }
};

module.exports = {
  getInsumos,
  getInsumoById,
  createInsumo,
  updateInsumo,
  deleteInsumo,
};