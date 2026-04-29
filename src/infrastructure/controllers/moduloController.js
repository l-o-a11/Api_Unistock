// infrastructure/controllers/moduloController.js

const ModuloRepository = require("../repositories/ModuloRepository");
const { ok, serverError } = require("../../shared/utils/response");

const repo = new ModuloRepository();

const getModulos = (req, res) => {
  try {
    const modulos = repo.findAll({ estado: true });
    return ok(res, modulos.map(m => m.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

module.exports = {
  getModulos,
};
