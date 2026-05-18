/**
 * roleController.js
 *
 * Endpoints:
 *   GET    /api/roles              — Listar roles (search, estado, paginación)
 *   GET    /api/roles/catalogos    — Módulos con privilegios disponibles (para el form)
 *   GET    /api/roles/:id          — Detalle de un rol
 *   POST   /api/roles              — Crear rol
 *   PUT    /api/roles/:id          — Actualizar rol
 *   DELETE /api/roles/:id          — Eliminar rol
 *   PATCH  /api/roles/:id/toggle   — Activar / inactivar rol
 */

const RoleRepository    = require("../repositories/RoleRepository");
const UserRepository    = require("../repositories/UserRepository");
const ModuleRepository  = require("../repositories/ModuleRepository");
const PrivilegeRepository = require("../repositories/PrivilegeRepository");
const CreateRole   = require("../../application/use-cases/roles/CreateRole");
const GetRole      = require("../../application/use-cases/roles/GetRole");
const GetRoleById  = require("../../application/use-cases/roles/GetRoleById");
const UpdateRole   = require("../../application/use-cases/roles/UpdateRole");
const DeleteRole   = require("../../application/use-cases/roles/DeleteRole");
const {
  ok, created, notFound, conflict, unprocessable, serverError,
} = require("../../shared/utils/response");

const roleRepo    = new RoleRepository();
const userRepo    = new UserRepository();
const moduleRepo  = new ModuleRepository();
const privilegeRepo = new PrivilegeRepository();

/**
 * GET /api/roles/catalogos
 * Devuelve módulos activos cada uno con su lista de privilegios activos.
 * El front usa esto para construir el selector de permisos.
 * Respuesta: [{ nombre, privilegios: ['crear','leer',...] }, ...]
 */
const getCatalogos = async (req, res) => {
  try {
    const modulos    = await moduleRepo.findAll({ estado: true });
    const privilegios = await privilegeRepo.findAll({ estado: true });

    const catalogo = modulos.map((m) => ({
      id: m.id,
      nombre: m.nombre,
      privilegios: privilegios.map((p) => ({ id: p.id, nombre: p.nombre })),
    }));

    return ok(res, catalogo);
  } catch (err) {
    return serverError(res);
  }
};

const getRoles = async (req, res) => {
  try {
    const result = await new GetRole(roleRepo).execute(req.query);
    // Resultado paginado (objeto) o array plano
    if (Array.isArray(result)) {
      return ok(res, result.map((r) => r.toPublic()));
    }
    return ok(res, {
      ...result,
      data: result.data.map((r) => r.toPublic()),
    });
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

const toggleRole = async (req, res) => {
  try {
    const role = await roleRepo.findById(req.params.id);
    if (!role) {
      return notFound(res, "Rol no encontrado");
    }
    const updatedRole = await roleRepo.update(req.params.id, {
      estado: !role.estado
    });
    return ok(res, updatedRole);
  } catch (err) {
    return serverError(res);
  }
};

module.exports = {
  getCatalogos,
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  toggleRole,
};