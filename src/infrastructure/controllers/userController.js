// infrastructure/controllers/UserController.js
// Recibe los requests HTTP, delega al use case correspondiente, responde.
// No contiene lógica de negocio — solo traduce HTTP ↔ use cases.

const UserRepository = require("../repositories/UserRepository");
const CreateUser = require("../../application/use-cases/users/CreateUser");
const GetUser = require("../../application/use-cases/users/GetUser");
const GetUserById = require("../../application/use-cases/users/GetUserById");
const UpdateUser = require("../../application/use-cases/users/UpdateUser");
const DeleteUser = require("../../application/use-cases/users/DeleteUser");
const LoginUser = require("../../application/use-cases/users/LoginUser");
const { generatePassword } = require("../../shared/utils/generatePassword");

const {
  ok,
  created,
  noContent,
  badRequest,
  notFound,
  conflict,
  unprocessable,
  unauthorized,
  serverError,
} = require("../../shared/utils/response");

const repo = new UserRepository();

// ── Auth ───────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const result = await new LoginUser(repo).execute(req.body);
    return ok(res, result);
  } catch (err) {
    if (err.statusCode === 401) return unauthorized(res, err.message);
    return serverError(res);
  }
};

const prepareWelcome = (req, res) => {
  return ok(res, { password: generatePassword() });
};

// ── Users CRUD ─────────────────────────────────────────────────────────────────
const getUsers = (req, res) => {
  try {
    const users = new GetUser(repo).execute(req.query);
    return ok(res, users);
  } catch (err) {
    return serverError(res);
  }
};

const getUserById = (req, res) => {
  try {
    const user = new GetUserById(repo).execute(req.params.id);
    return ok(res, user);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    return serverError(res);
  }
};

const createUser = async (req, res) => {
  try {
    const result = await new CreateUser(repo).execute(req.body);
    return created(res, result);
  } catch (err) {
    if (err.statusCode === 409) return conflict(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

const updateUser = (req, res) => {
  try {
    const user = new UpdateUser(repo).execute(req.params.id, req.body);
    return ok(res, user);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 409) return conflict(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

const toggleStatus = (req, res) => {
  try {
    const user = repo.findById(req.params.id);
    if (!user) return notFound(res, "Usuario no encontrado");

    if (user.isLastActiveAdmin(repo.countActiveAdmins())) {
      return unprocessable(
        res,
        "No se puede desactivar el único administrador activo",
      );
    }

    const updated = repo.update(req.params.id, { estado: !user.estado });
    return ok(res, updated.toPublic());
  } catch (err) {
    return serverError(res);
  }
};

const deleteUser = (req, res) => {
  try {
    new DeleteUser(repo).execute(req.params.id);
    return noContent(res);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

// ── Catálogos ──────────────────────────────────────────────────────────────────
const getRoles = (req, res) => ok(res, repo.findAllRoles());
const getSedes = (req, res) => ok(res, repo.findAllSedes());

module.exports = {
  login,
  prepareWelcome,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleStatus,
  deleteUser,
  getRoles,
  getSedes,
};