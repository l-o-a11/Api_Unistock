// infrastructure/controllers/siteController.js
// Recibe los requests HTTP, delega al use case correspondiente, responde.
// No contiene lógica de negocio — solo traduce HTTP ↔ use cases.

const SiteRepository = require("../repositories/SiteRepository");
const UserRepository = require("../repositories/UserRepository");
const CreateSite = require("../../application/use-cases/sites/CreateSites");
const GetSites = require("../../application/use-cases/sites/GetSites");
const GetSiteById = require("../../application/use-cases/sites/GetSedeById");
const UpdateSite = require("../../application/use-cases/sites/UpdateSites");
const DeleteSite = require("../../application/use-cases/sites/DeleteSites");

const {
    ok,
    created,
    noContent,
    badRequest,
    notFound,
    conflict,
    unprocessable,
    serverError,
} = require("../../shared/utils/response");

const siteRepo = new SiteRepository();
const userRepo = new UserRepository();

// ── Sites CRUD ─────────────────────────────────────────────────────────────────
const getSites = async (req, res) => {
    try {
        const sites = await new GetSite(siteRepo).execute(req.query);
        return ok(res, sites);
    } catch (err) {
        return serverError(res);
    }
};

const getSiteById = async (req, res) => {
    try {
        const site = await new GetSiteById(siteRepo).execute(req.params.id);
        return ok(res, site);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        return serverError(res);
    }
};

const createSite = async (req, res) => {
    try {
        const site = await new CreateSite(siteRepo).execute(req.body);
        return created(res, site);
    } catch (err) {
        if (err.statusCode === 409) return conflict(res, err.message);
        if (err.statusCode === 422) return unprocessable(res, err.message);
        return serverError(res);
    }
};

const updateSite = async (req, res) => {
    try {
        const site = await new UpdateSite(siteRepo).execute(req.params.id, req.body);
        return ok(res, site);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        if (err.statusCode === 409) return conflict(res, err.message);
        return serverError(res);
    }
};

const deleteSite = async (req, res) => {
    try {
        await new DeleteSite(siteRepo, userRepo).execute(req.params.id);
        return noContent(res);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        if (err.statusCode === 422) return unprocessable(res, err.message);
        return serverError(res);
    }
};
const toggleSite = async (req, res) => {
  try {
    const site = await siteRepo.findById(req.params.id);
    if (!site) {
      return notFound(res, "Sede no encontrada");
    }
    const updatedSite = await siteRepo.update(req.params.id, {
      estado: !site.estado
    });
    return ok(res, updatedSite.toJSON());
  } catch (err) {
    return serverError(res);
  }
};

module.exports = {
    getSites,
    getSiteById,
    createSite,
    updateSite,
    deleteSite,
    toggleSite,
};