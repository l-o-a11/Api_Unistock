// infrastructure/controllers/moduleController.js

const ModuleRepository = require("../repositories/ModuleRepository");
const { ok, serverError } = require("../../shared/utils/response");

const repo = new ModuleRepository();

const getModules = async (req, res) => {
  try {
    const modules = await repo.findAll({ estado: true });
    return ok(res, modules.map((m) => m.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

module.exports = {
  getModules,
};
