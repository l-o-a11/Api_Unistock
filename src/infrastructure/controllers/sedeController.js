// infrastructure/controllers/sedeController.js
// Recibe los requests HTTP, delega al use case correspondiente, responde.
// No contiene lógica de negocio — solo traduce HTTP ↔ use cases.

const SedeRepository = require("../repositories/SedeRepository");
const UserRepository = require("../repositories/UserRepository");
const CreateSede = require("../../application/use-cases/sites/CreateSites");
const GetSede = require("../../application/use-cases/sites/GetSites");
const GetSedeById = require("../../application/use-cases/sites/GetSedeById");
const UpdateSede = require("../../application/use-cases/sites/UpdateSites");
const DeleteSede = require("../../application/use-cases/sites/DeleteSites");

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

const sedeRepo = new SedeRepository();
const userRepo = new UserRepository();

// ── Sedes CRUD ─────────────────────────────────────────────────────────────────
const getSedes = (req, res) => {
    try {
        const sedes = new GetSede(sedeRepo).execute(req.query);
        return ok(res, sedes);
    } catch (err) {
        return serverError(res);
    }
};

const getSedeById = (req, res) => {
    try {
        const sede = new GetSedeById(sedeRepo).execute(req.params.id);
        return ok(res, sede);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        return serverError(res);
    }
};

const createSede = async (req, res) => {
    try {
        const sede = await new CreateSede(sedeRepo).execute(req.body);
        return created(res, sede);
    } catch (err) {
        if (err.statusCode === 409) return conflict(res, err.message);
        if (err.statusCode === 422) return unprocessable(res, err.message);
        return serverError(res);
    }
};

const updateSede = async (req, res) => {
    try {
        const sede = await new UpdateSede(sedeRepo).execute(req.params.id, req.body);
        return ok(res, sede);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        if (err.statusCode === 409) return conflict(res, err.message);
        return serverError(res);
    }
};

const deleteSede = async (req, res) => {
    try {
        await new DeleteSede(sedeRepo, userRepo).execute(req.params.id);
        return noContent(res);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        if (err.statusCode === 422) return unprocessable(res, err.message);
        return serverError(res);
    }
};

module.exports = {
    getSedes,
    getSedeById,
    createSede,
    updateSede,
    deleteSede,
};