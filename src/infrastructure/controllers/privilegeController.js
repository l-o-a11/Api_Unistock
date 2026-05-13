/**
 * privilegeController.js
 * CRUD completo para privilegios del sistema.
 * Los privilegios son las acciones (crear, leer, actualizar, eliminar) que se asignan
 * dentro de cada módulo al crear o editar un rol.
 */

const PrivilegeRepository = require("../repositories/PrivilegeRepository");
const { ok, created, noContent, badRequest, notFound, conflict, serverError } = require("../../shared/utils/response");

const repo = new PrivilegeRepository();

const getPrivileges = async (req, res) => {
  try {
    const privileges = await repo.findAll(req.query);
    return ok(res, privileges.map((p) => p.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

const getPrivilegeById = async (req, res) => {
  try {
    const privilege = await repo.findById(req.params.id);
    if (!privilege) return notFound(res, "Privilegio no encontrado");
    return ok(res, privilege.toPublic());
  } catch (err) {
    return serverError(res);
  }
};

const createPrivilege = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre || !nombre.trim()) {
      return badRequest(res, "El nombre del privilegio es requerido");
    }
    const existing = await repo.findByNombre(nombre);
    if (existing) return conflict(res, "Ya existe un privilegio con ese nombre");

    const privilege = await repo.create({ nombre, estado: req.body.estado });
    return created(res, privilege.toPublic());
  } catch (err) {
    if (err.code === 11000) return conflict(res, "Ya existe un privilegio con ese nombre");
    return serverError(res);
  }
};

const updatePrivilege = async (req, res) => {
  try {
    const privilege = await repo.findById(req.params.id);
    if (!privilege) return notFound(res, "Privilegio no encontrado");

    const { nombre, estado } = req.body;
    if (nombre && nombre !== privilege.nombre) {
      const existing = await repo.findByNombre(nombre);
      if (existing) return conflict(res, "Ya existe un privilegio con ese nombre");
    }

    const updated = await repo.update(req.params.id, { nombre, estado });
    return ok(res, updated.toPublic());
  } catch (err) {
    if (err.code === 11000) return conflict(res, "Ya existe un privilegio con ese nombre");
    return serverError(res);
  }
};

const deletePrivilege = async (req, res) => {
  try {
    const privilege = await repo.findById(req.params.id);
    if (!privilege) return notFound(res, "Privilegio no encontrado");
    await repo.delete(req.params.id);
    return noContent(res);
  } catch (err) {
    return serverError(res);
  }
};

module.exports = { getPrivileges, getPrivilegeById, createPrivilege, updatePrivilege, deletePrivilege };
