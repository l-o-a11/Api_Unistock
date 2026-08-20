// infrastructures/controllers/thirdPartyController.js

const ThirdPartyRepository = require('../repositories/ThirdPartyRepository');
const GetThirdParties      = require('../../application/use-cases/thirdParties/GetThirdParties');
const GetThirdPartyById    = require('../../application/use-cases/thirdParties/GetThirdPartyById');
const CreateThirdParty     = require('../../application/use-cases/thirdParties/CreateThirdParty');
const UpdateThirdParties = require('../../application/use-cases/thirdParties/UpdateThirdParties');
const DeleteThirdParty     = require('../../application/use-cases/thirdParties/DeleteThirdParty');
const ToggleThirdParty     = require('../../application/use-cases/thirdParties/ToggleThirdParty');
const LinkProduccion       = require('../../application/use-cases/thirdParties/LinkProduccion');
const {
  ok, created, badRequest, notFound, conflict,
  unprocessable, serverError,
} = require('../../shared/utils/response');

const repo = new ThirdPartyRepository();

const normalizeBody = (body) => ({
  nit:             body.nit             || null,
  nombre_empresa:  body.nombre_empresa  ?? body.nombreEmpresa  ?? body.nombre  ?? null,
  nombre_contacto: body.nombre_contacto ?? body.nombreContacto ?? body.contacto ?? null,
  direccion:       body.direccion       || null,
  telefono:        body.telefono        || null,
  correo_empresa:  body.correo_empresa  ?? body.correoEmpresa  ?? body.correo ?? body.email ?? null,
  correo_contacto: body.correo_contacto ?? body.correoContacto ?? null,
  sitio_web:       body.sitio_web       ?? body.sitioWeb       ?? null,
  estado:          body.estado,
});

const getThirdParties = async (req, res) => {
  try {
    const result = await new GetThirdParties(repo).execute(req.query);
    return ok(res, result);
  } catch (err) {
    console.error('[ThirdParty] getThirdParties:', err.message);
    return serverError(res, err.message);
  }
};

const getThirdPartyById = async (req, res) => {
  try {
    const data = await new GetThirdPartyById(repo).execute(req.params.id);
    return ok(res, data);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    console.error('[ThirdParty] getThirdPartyById:', err.message);
    return serverError(res, err.message);
  }
};

const createThirdParty = async (req, res) => {
  try {
    const normalized = normalizeBody(req.body);
    const data = await new CreateThirdParty(repo).execute(normalized);
    return created(res, data);
  } catch (err) {
    if (err.statusCode === 400) return badRequest(res, err.message);
    if (err.statusCode === 409) return conflict(res, err.message);
    console.error('[ThirdParty] createThirdParty:', err.message);
    return serverError(res, err.message);
  }
};

const updateThirdParty = async (req, res) => {
  try {
    const normalized = normalizeBody(req.body);
    const data = await new UpdateThirdParties(repo).execute(req.params.id, normalized);
    return ok(res, data);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 400) return badRequest(res, err.message);
    if (err.statusCode === 409) return conflict(res, err.message);
    console.error('[ThirdParty] updateThirdParty:', err.message);
    return serverError(res, err.message);
  }
};

const deleteThirdParty = async (req, res) => {
  try {
    await new DeleteThirdParty(repo).execute(req.params.id);
    return ok(res, { message: 'Tercero eliminado exitosamente' });
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    console.error('[ThirdParty] deleteThirdParty:', err.message);
    return serverError(res, err.message);
  }
};

const toggleThirdParty = async (req, res) => {
  try {
    const data = await new ToggleThirdParty(repo).execute(req.params.id);
    return ok(res, data);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    console.error('[ThirdParty] toggleThirdParty:', err.message);
    return serverError(res, err.message);
  }
};

// ── POST /terceros/:id/producciones ──────────────────────────────────────────
const linkProduccion = async (req, res) => {
  try {
    const { orden, fecha, produccionId, cantidad } = req.body;
    const data = await new LinkProduccion(repo).execute(
      req.params.id, { orden, fecha, produccionId, cantidad }
    );
    return ok(res, data);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 400) return badRequest(res, err.message);
    console.error('[ThirdParty] linkProduccion:', err.message);
    return serverError(res, err.message);
  }
};

module.exports = {
  getThirdParties,
  getThirdPartyById,
  createThirdParty,
  updateThirdParty,
  deleteThirdParty,
  toggleThirdParty,
  linkProduccion,
};
