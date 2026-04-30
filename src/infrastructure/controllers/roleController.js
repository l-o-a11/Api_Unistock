/**
 * roleController.js
 * 
 * Controlador para la gestión de Roles.
 * Maneja operaciones CRUD para roles y sus permisos.
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const RoleRepository = require("../repositories/RoleRepository");
const UserRepository = require("../repositories/UserRepository");
const ModuloRepository = require("../repositories/ModuloRepository");
const PrivilegioRepository = require("../repositories/PrivilegioRepository");
const CreateRole = require("../../application/use-cases/roles/CreateRole");
const GetRole = require("../../application/use-cases/roles/GetRole");
const GetRoleById = require("../../application/use-cases/roles/GetRoleById");
const UpdateRole = require("../../application/use-cases/roles/UpdateRole");
const DeleteRole = require("../../application/use-cases/roles/DeleteRole");
const { ok, created, badRequest, notFound, conflict, unprocessable, serverError } = require("../../shared/utils/response");

const roleRepo = new RoleRepository();
const userRepo = new UserRepository();
const moduloRepo = new ModuloRepository();
const privilegioRepo = new PrivilegioRepository();

const getModulos = (req, res) => {
  try {
    const modulos = moduloRepo.findAll({ estado: true });
    return ok(res, modulos.map(m => m.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

const getPrivilegios = (req, res) => {
  try {
    const privilegios = privilegioRepo.findAll({ estado: true });
    return ok(res, privilegios.map(p => p.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

const getRoles = (req, res) => {
  try {
    const roles = new GetRole(roleRepo).execute(req.query);
    return ok(res, roles.map(r => r.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

const getRoleById = (req, res) => {
  try {
    const role = new GetRoleById(roleRepo).execute(req.params.id);
    return ok(res, role.toPublic());
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    return serverError(res);
  }
};

const createRole = async (req, res) => {
  try {
    const role = await new CreateRole(roleRepo, moduloRepo, privilegioRepo).execute(req.body);
    return created(res, role.toPublic());
  } catch (err) {
    if (err.statusCode === 409) return conflict(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

const updateRole = async (req, res) => {
  try {
    const role = await new UpdateRole(roleRepo, moduloRepo, privilegioRepo).execute(req.params.id, req.body);
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
  getModulos,
  getPrivilegios,
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};