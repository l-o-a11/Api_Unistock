// infrastructure/controllers/categoriaInsumoController.js
// Recibe los requests HTTP, delega al use case correspondiente, responde.
// No contiene lógica de negocio — solo traduce HTTP ↔ use cases.

const CategoriaInsumoRepository = require("../repositories/CategoriaInsumoRepository");
const InsumoRepository = require("../repositories/InsumoRepository");
const CreateCategoriaInsumo = require("../../application/use-cases/categoriasInsumos/CreateCategoriaInsumo");
const GetCategoriaInsumo = require("../../application/use-cases/categoriasInsumos/GetCategoriaInsumo");
const GetCategoriaInsumoById = require("../../application/use-cases/categoriasInsumos/GetCategoriaInsumoById");
const UpdateCategoriaInsumo = require("../../application/use-cases/categoriasInsumos/UpdateCategoriaInsumo");
const DeleteCategoriaInsumo = require("../../application/use-cases/categoriasInsumos/DeleteCategoriaInsumo");

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

const categoriaRepo = new CategoriaInsumoRepository();
const insumoRepo = new InsumoRepository();

// ── CategoriasInsumos CRUD ─────────────────────────────────────────────────────────────────
const getCategoriasInsumos = (req, res) => {
    try {
        const categorias = new GetCategoriaInsumo(categoriaRepo).execute(req.query);
        return ok(res, categorias);
    } catch (err) {
        return serverError(res);
    }
};

const getCategoriaInsumoById = (req, res) => {
    try {
        const categoria = new GetCategoriaInsumoById(categoriaRepo).execute(req.params.id);
        return ok(res, categoria);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        return serverError(res);
    }
};

const createCategoriaInsumo = async (req, res) => {
    try {
        const categoria = await new CreateCategoriaInsumo(categoriaRepo).execute(req.body);
        return created(res, categoria);
    } catch (err) {
        if (err.statusCode === 409) return conflict(res, err.message);
        if (err.statusCode === 422) return unprocessable(res, err.message);
        return serverError(res);
    }
};

const updateCategoriaInsumo = async (req, res) => {
    try {
        const categoria = await new UpdateCategoriaInsumo(categoriaRepo).execute(req.params.id, req.body);
        return ok(res, categoria);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        if (err.statusCode === 409) return conflict(res, err.message);
        return serverError(res);
    }
};

const deleteCategoriaInsumo = async (req, res) => {
    try {
        await new DeleteCategoriaInsumo(categoriaRepo, insumoRepo).execute(req.params.id);
        return noContent(res);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        if (err.statusCode === 422) return unprocessable(res, err.message);
        return serverError(res);
    }
};

module.exports = {
    getCategoriasInsumos,
    getCategoriaInsumoById,
    createCategoriaInsumo,
    updateCategoriaInsumo,
    deleteCategoriaInsumo,
};