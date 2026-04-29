// infrastructure/controllers/thirdPartiesController.js
const ThirdPartiesRepository = require("../repositories/ThirdPartiesRepository");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const repo = new ThirdPartiesRepository();

const getThirdParties = async (req, res) => {
  try {
    return ok(res, await repo.findAll(req.query));
  } catch (err) { return serverError(res); }
};

const getThirdPartyById = async (req, res) => {
  try {
    const tp = await repo.findById(req.params.id);
    if (!tp) return notFound(res, "Tercero no encontrado");
    return ok(res, tp);
  } catch (err) { return serverError(res); }
};

const createThirdParty = async (req, res) => {
  try {
    const { nombre, contacto, barrio, direccion, telefono } = req.body;
    if (!nombre || !contacto || !direccion || !telefono)
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    const tp = await repo.create({ nombre, contacto, barrio, direccion, telefono, estado: true });
    return created(res, tp);
  } catch (err) { return serverError(res); }
};

const updateThirdParty = async (req, res) => {
  try {
    const tp = await repo.findById(req.params.id);
    if (!tp) return notFound(res, "Tercero no encontrado");
    return ok(res, await repo.update(req.params.id, req.body));
  } catch (err) { return serverError(res); }
};

const deleteThirdParty = async (req, res) => {
  try {
    const tp = await repo.findById(req.params.id);
    if (!tp) return notFound(res, "Tercero no encontrado");
    await repo.delete(req.params.id);
    return ok(res, { message: "Tercero eliminado exitosamente" });
  } catch (err) { return serverError(res); }
};

module.exports = { getThirdParties, getThirdPartyById, createThirdParty, updateThirdParty, deleteThirdParty };
