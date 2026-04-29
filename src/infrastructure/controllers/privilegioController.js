// infrastructure/controllers/privilegioController.js

const PrivilegioRepository = require("../repositories/PrivilegioRepository");
const { ok, serverError } = require("../../shared/utils/response");

const repo = new PrivilegioRepository();

const getPrivilegios = (req, res) => {
    try {
        const privilegios = repo.findAll({ estado: true });
        return ok(res, privilegios.map(p => p.toPublic()));
    } catch (err) {
        return serverError(res);
    }
};

module.exports = {
    getPrivilegios,
};
