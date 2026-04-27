/**
 * thirdPartiesController.js
 * 
 * Controlador para la gestión de Terceros (Third Parties).
 * Maneja operaciones CRUD para contratistas externos.
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const ThirdPartiesRepository = require("../repositories/ThirdPartiesRepository");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const repo = new ThirdPartiesRepository();

const getThirdParties = (req, res) => {
  try {
    const thirdParties = repo.findAll(req.query);
    return ok(res, thirdParties);
  } catch (err) {
    return serverError(res);
  }
};

const getThirdPartyById = (req, res) => {
  try {
    const thirdParty = repo.findById(req.params.id);
    if (!thirdParty) return notFound(res, "Tercero no encontrado");
    return ok(res, thirdParty);
  } catch (err) {
    return serverError(res);
  }
};

const createThirdParty = (req, res) => {
  try {
    const { nombre, contacto, barrio, direccion, telefono } = req.body;
    if (!nombre || !contacto || !direccion || !telefono) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const thirdParty = repo.create({
      nombre,
      contacto,
      barrio,
      direccion,
      telefono,
      estado: true,
    });
    return created(res, thirdParty);
  } catch (err) {
    return serverError(res);
  }
};

const updateThirdParty = (req, res) => {
  try {
    const thirdParty = repo.findById(req.params.id);
    if (!thirdParty) return notFound(res, "Tercero no encontrado");
    const updated = repo.update(req.params.id, req.body);
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const deleteThirdParty = (req, res) => {
  try {
    const thirdParty = repo.findById(req.params.id);
    if (!thirdParty) return notFound(res, "Tercero no encontrado");
    repo.delete(req.params.id);
    return ok(res, { message: "Tercero eliminado exitosamente" });
  } catch (err) {
    return serverError(res);
  }
};

module.exports = {
  getThirdParties,
  getThirdPartyById,
  createThirdParty,
  updateThirdParty,
  deleteThirdParty,
};
