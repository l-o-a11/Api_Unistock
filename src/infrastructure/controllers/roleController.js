/**
 * roleController.js
 *
 * Controller for Role management.
 * Handles CRUD operations for roles and their permissions.
 */

const RoleRepository = require("../repositories/RoleRepository");
const UserRepository = require("../repositories/UserRepository");
const ModuleRepository = require("../repositories/ModuleRepository");
const PrivilegeRepository = require("../repositories/PrivilegeRepository");
const CreateRole = require("../../application/use-cases/roles/CreateRole");
const GetRole = require("../../application/use-cases/roles/GetRole");
const GetRoleById = require("../../application/use-cases/roles/GetRoleById");
const UpdateRole = require("../../application/use-cases/roles/UpdateRole");
const DeleteRole = require("../../application/use-cases/roles/DeleteRole");
const { ok, created, notFound, conflict, unprocessable, serverError } = require("../../shared/utils/response");

const roleRepo = new RoleRepository();
const userRepo = new UserRepository();
const moduleRepo = new ModuleRepository();
const privilegeRepo = new PrivilegeRepository();

const getModules = async (req, res) => {
  try {
    const modules = await moduleRepo.findAll({ estado: true });
    return ok(res, modules.map((m) => m.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

const getPrivileges = async (req, res) => {
  try {
    const privileges = await privilegeRepo.findAll({ estado: true });
    return ok(res, privileges.map((p) => p.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await new GetRole(roleRepo).execute(req.query);
    return ok(res, roles.map((r) => r.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

const getRoleById = async (req, res) => {
  try {
    const role = await new GetRoleById(roleRepo).execute(req.params.id);
    return ok(res, role.toPublic());
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    return serverError(res);
  }
};

const createRole = async (req, res) => {
  try {
    const role = await new CreateRole(roleRepo, moduleRepo, privilegeRepo).execute(req.body);
    return created(res, role.toPublic());
  } catch (err) {
    if (err.statusCode === 409) return conflict(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

const updateRole = async (req, res) => {
  try {
    const role = await new UpdateRole(roleRepo, moduleRepo, privilegeRepo).execute(req.params.id, req.body);
    return ok(res, role.toPublic());
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 409) return conflict(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

const deleteRole = async (req, res) => {
  try {
    await new DeleteRole(roleRepo, userRepo).execute(req.params.id);
    return ok(res, { message: "Rol eliminado exitosamente" });
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

module.exports = {
  getModules,
  getPrivileges,
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
