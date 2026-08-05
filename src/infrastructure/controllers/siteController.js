// infrastructure/controllers/siteController.js
// Recibe los requests HTTP, delega al use case correspondiente, responde.
// No contiene lógica de negocio — solo traduce HTTP ↔ use cases.

const SiteRepository       = require("../repositories/SiteRepository");
const UserRepository       = require("../repositories/UserRepository");

const CreateSite   = require("../../application/use-cases/sites/CreateSites");
const GetSites     = require("../../application/use-cases/sites/GetSites");
const GetSiteById  = require("../../application/use-cases/sites/GetSedeById");
const UpdateSite   = require("../../application/use-cases/sites/UpdateSites");
const DeleteSite   = require("../../application/use-cases/sites/DeleteSites");

const {
    ok,
    created,
    noContent,
    badRequest,
    notFound,
    conflict,
    unprocessable,
    serverError,
    forbidden,
} = require("../../shared/utils/response");
const {
    isManagerOrAdmin,
    extractManagerPassword,
    verifyManagerPassword,
} = require("../../shared/utils/managerAuth");

const siteRepo = new SiteRepository();
const userRepo = new UserRepository();

// ── GET /api/sites ─────────────────────────────────────────────────────────────
const getSites = async (req, res) => {
    try {
        // FIX #1: era "new GetSite(...)" — la clase importada se llama GetSites
        const sites = await new GetSites(siteRepo).execute(req.query);
        return ok(res, sites);
    } catch (err) {
        return serverError(res, err.message);
    }
};

// ── GET /api/sites/:id ─────────────────────────────────────────────────────────
const getSiteById = async (req, res) => {
    try {
        const site = await new GetSiteById(siteRepo).execute(req.params.id);
        return ok(res, site);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        return serverError(res, err.message);
    }
};

// ── POST /api/sites ────────────────────────────────────────────────────────────
const createSite = async (req, res) => {
    try {
        const site = await new CreateSite(siteRepo).execute(req.body);
        return created(res, site);
    } catch (err) {
        // FIX #2: faltaba capturar statusCode 400 (campos requeridos faltantes)
        if (err.statusCode === 400) return badRequest(res, err.message);
        if (err.statusCode === 409) return conflict(res, err.message);
        if (err.statusCode === 422) return unprocessable(res, err.message);
        return serverError(res, err.message);
    }
};

// ── PUT /api/sites/:id ─────────────────────────────────────────────────────────
const updateSite = async (req, res) => {
    try {
        const site = await new UpdateSite(siteRepo).execute(req.params.id, req.body);
        return ok(res, site);
    } catch (err) {
        if (err.statusCode === 400) return badRequest(res, err.message);
        if (err.statusCode === 404) return notFound(res, err.message);
        if (err.statusCode === 409) return conflict(res, err.message);
        return serverError(res, err.message);
    }
};

// ── DELETE /api/sites/:id ──────────────────────────────────────────────────────
const deleteSite = async (req, res) => {
    try {
        const site = await siteRepo.findById(req.params.id);
        if (!site) return notFound(res, "Sede no encontrada");

        if (!isManagerOrAdmin(req.user?.rolNombre)) {
            return forbidden(res, "Solo gerentes o administradores pueden eliminar sedes.");
        }

        const password = extractManagerPassword(req);
        if (!password) {
            return badRequest(res, "Se requiere la contraseña del gerente para eliminar la sede.");
        }

        const passwordOk = await verifyManagerPassword(userRepo, req.user?.id, password);
        if (!passwordOk) {
            return forbidden(res, "Contraseña del gerente incorrecta.");
        }

        await new DeleteSite(siteRepo, userRepo).execute(req.params.id);
        return noContent(res);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        if (err.statusCode === 422) return unprocessable(res, err.message);
        return serverError(res, err.message);
    }
};

// ── PATCH /api/sites/:id/toggle ────────────────────────────────────────────────
const toggleSite = async (req, res) => {
    try {
        const site = await siteRepo.findById(req.params.id);
        if (!site) return notFound(res, "Sede no encontrada");

        if (!isManagerOrAdmin(req.user?.rolNombre)) {
            return forbidden(res, "Solo gerentes o administradores pueden cambiar el estado de la sede.");
        }

        const password = extractManagerPassword(req);
        if (!password) {
            return badRequest(res, "Se requiere la contraseña del gerente para cambiar el estado de la sede.");
        }

        const passwordOk = await verifyManagerPassword(userRepo, req.user?.id, password);
        if (!passwordOk) {
            return forbidden(res, "Contraseña del gerente incorrecta.");
        }

        const updatedSite = await siteRepo.update(req.params.id, { estado: !site.estado });

        if (!updatedSite) return serverError(res, "No se pudo actualizar el estado");

        return ok(res, updatedSite);
    } catch (err) {
        return serverError(res, err.message);
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
