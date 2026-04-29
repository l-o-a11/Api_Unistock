/**
 * rolController.js
 * 
 * Controlador para la gestión de Roles.
 * Maneja operaciones CRUD para roles y sus permisos.
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const RolRepository = require("../repositories/RolRepository");
const UserRepository = require("../repositories/UserRepository");
const ModuloRepository = require("../repositories/ModuloRepository");
const PrivilegioRepository = require("../repositories/PrivilegioRepository");
const CreateRol = require("../../application/use-cases/roles/CreateRol");
const GetRol = require("../../application/use-cases/roles/GetRol");
const GetRolById = require("../../application/use-cases/roles/GetRolById");
const UpdateRol = require("../../application/use-cases/roles/UpdateRol");
const DeleteRol = require("../../application/use-cases/roles/DeleteRol");
const { ok, created, badRequest, notFound, conflict, unprocessable, serverError } = require("../../shared/utils/response");

const rolRepo = new RolRepository();
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
    const roles = new GetRol(rolRepo).execute(req.query);
    return ok(res, roles.map(r => r.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

const getRolById = (req, res) => {
  try {
    const rol = new GetRolById(rolRepo).execute(req.params.id);
    return ok(res, rol.toPublic());
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    return serverError(res);
  }
};

const createRol = async (req, res) => {
  try {
    const rol = await new CreateRol(rolRepo, moduloRepo, privilegioRepo).execute(req.body);
    return created(res, rol.toPublic());
  } catch (err) {
    if (err.statusCode === 409) return conflict(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

const updateRol = async (req, res) => {
  try {
    const rol = await new UpdateRol(rolRepo, moduloRepo, privilegioRepo).execute(req.params.id, req.body);
    return ok(res, rol.toPublic());
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 409) return conflict(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

const deleteRol = async (req, res) => {
  try {
    await new DeleteRol(rolRepo, userRepo).execute(req.params.id);
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
  getRolById,
  createRol,
  updateRol,
  deleteRol,
};