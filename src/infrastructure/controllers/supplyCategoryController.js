// infrastructure/controllers/supplyCategoryController.js

const SupplyCategoryRepository = require("../repositories/SupplyCategoryRepository");
const SupplyRepository = require("../repositories/SupplyRepository");
const UserRepository = require("../repositories/UserRepository");
const CreateSupplyCategory = require("../../application/use-cases/supplyCategories/CreateSupplyCategory");
const GetSupplyCategory = require("../../application/use-cases/supplyCategories/GetSuppliesCategory");
const GetSupplyCategoryById = require("../../application/use-cases/supplyCategories/GetSupplyCategoryById");
const UpdateSupplyCategory = require("../../application/use-cases/supplyCategories/UpdateSupplyCategory");
const DeleteSupplyCategory = require("../../application/use-cases/supplyCategories/DeleteSupplyCategory");

const {
    ok,
    created,
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

const categoryRepo = new SupplyCategoryRepository();
const supplyRepo = new SupplyRepository();
const userRepo = new UserRepository();

const getSupplyCategories = async (req, res) => {
    try {
        const categories = await new GetSupplyCategory(categoryRepo).execute(req.query);
        return ok(res, categories);
    } catch (err) {
        console.error("GetSupplyCategories error:", err);
        return serverError(res);
    }
};

const getSupplyCategoryById = async (req, res) => {
    try {
        const category = await new GetSupplyCategoryById(categoryRepo).execute(req.params.id);
        return ok(res, category);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        return serverError(res);
    }
};

const createSupplyCategory = async (req, res) => {
    try {
        const category = await new CreateSupplyCategory(categoryRepo).execute(req.body);
        return created(res, category);
    } catch (err) {
        if (err.statusCode === 409) return conflict(res, err.message);
        if (err.statusCode === 422) return unprocessable(res, err.message);
        return serverError(res);
    }
};

const updateSupplyCategory = async (req, res) => {
    try {
        const category = await new UpdateSupplyCategory(categoryRepo).execute(req.params.id, req.body);
        return ok(res, category);
    } catch (err) {
        if (err.statusCode === 404) return notFound(res, err.message);
        if (err.statusCode === 409) return conflict(res, err.message);
        return serverError(res);
    }
};

const deleteSupplyCategory = async (req, res) => {
    try {
        if (!isManagerOrAdmin(req.user?.rolNombre)) {
            return forbidden(res, "Solo gerentes o administradores pueden eliminar categorías de insumos.");
        }

        const password = extractManagerPassword(req);
        if (!password) {
            return badRequest(res, "Se requiere la contraseña del gerente para eliminar la categoría de insumos.");
        }

        const passwordOk = await verifyManagerPassword(userRepo, req.user?.id, password);
        if (!passwordOk) {
            return forbidden(res, "Contraseña del gerente incorrecta.");
        }

        const result = await new DeleteSupplyCategory(categoryRepo, supplyRepo).execute(req.params.id);
        return ok(res, result);
    } catch (err) {
        console.error("DeleteSupplyCategory error:", err.message);
        if (err.statusCode === 400) return badRequest(res, err.message);
        if (err.statusCode === 404) return notFound(res, err.message);
        if (err.statusCode === 422) return unprocessable(res, err.message);
        return serverError(res);
    }
};

module.exports = {
    getSupplyCategories,
    getSupplyCategoryById,
    createSupplyCategory,
    updateSupplyCategory,
    deleteSupplyCategory,
};
