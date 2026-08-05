/**
 * moduleController.js
 * CRUD completo para módulos del sistema.
 * Los módulos son los que se asignan a roles como unidades de acceso.
 */

const ModuleRepository = require("../repositories/ModuleRepository");
const { ok, created, noContent, badRequest, notFound, conflict, serverError } = require("../../shared/utils/response");

const repo = new ModuleRepository();

const getModules = async (req, res) => {
  try {
    const modules = await repo.findAll(req.query);
    return ok(res, modules.map((m) => m.toPublic()));
  } catch (err) {
    return serverError(res);
  }
};

const getModuleById = async (req, res) => {
  try {
    const module = await repo.findById(req.params.id);
    if (!module) return notFound(res, "Módulo no encontrado");
    return ok(res, module.toPublic());
  } catch (err) {
    return serverError(res);
  }
};

const createModule = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre || !nombre.trim()) {
      return badRequest(res, "El nombre del módulo es requerido");
    }
    const existing = await repo.findByNombre(nombre);
    if (existing) return conflict(res, "Ya existe un módulo con ese nombre");

    const module = await repo.create({ nombre, estado: req.body.estado });
    return created(res, module.toPublic());
  } catch (err) {
    if (err.code === 11000) return conflict(res, "Ya existe un módulo con ese nombre");
    return serverError(res);
  }
};

const updateModule = async (req, res) => {
  try {
    const module = await repo.findById(req.params.id);
    if (!module) return notFound(res, "Módulo no encontrado");

    const { nombre, estado } = req.body;
    if (nombre && nombre !== module.nombre) {
      const existing = await repo.findByNombre(nombre);
      if (existing) return conflict(res, "Ya existe un módulo con ese nombre");
    }

    const updated = await repo.update(req.params.id, { nombre, estado });
    return ok(res, updated.toPublic());
  } catch (err) {
    if (err.code === 11000) return conflict(res, "Ya existe un módulo con ese nombre");
    return serverError(res);
  }
};

const deleteModule = async (req, res) => {
  try {
    const module = await repo.findById(req.params.id);
    if (!module) return notFound(res, "Módulo no encontrado");
    await repo.delete(req.params.id);
    return noContent(res);
  } catch (err) {
    return serverError(res);
  }
};

module.exports = { getModules, getModuleById, createModule, updateModule, deleteModule };
