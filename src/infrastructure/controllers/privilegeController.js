// infrastructure/controllers/privilegeController.js

const PrivilegeRepository = require("../repositories/PrivilegeRepository");
const { ok, serverError } = require("../../shared/utils/response");

const repo = new PrivilegeRepository();

const getPrivileges = async (req, res) => {
  try {
    const privileges = await repo.findAll({ estado: true });
    return ok(res, privileges.map((p) => p.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

module.exports = {
  getPrivileges,
};
