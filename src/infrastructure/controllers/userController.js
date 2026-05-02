const UserRepository = require("../repositories/UserRepository");
const CreateUser = require("../../application/use-cases/users/CreateUser");
const GetUser = require("../../application/use-cases/users/GetUser");
const GetUserById = require("../../application/use-cases/users/GetUserById");
const UpdateUser = require("../../application/use-cases/users/UpdateUser");
const DeleteUser = require("../../application/use-cases/users/DeleteUser");
const LoginUser = require("../../application/use-cases/users/LoginUser");
const { generatePassword } = require("../../shared/utils/generatePassword");
const { ok, created, noContent, notFound, conflict, unprocessable, unauthorized, forbidden, serverError } = require("../../shared/utils/response");

const repo = new UserRepository();

const login = async (req, res) => {
  try {
    return ok(res, await new LoginUser(repo).execute(req.body));
  } catch (err) {
    if (err.statusCode === 401) return unauthorized(res, err.message);
    return serverError(res);
  }
};

const prepareWelcome = (req, res) => ok(res, { password: generatePassword() });

const getUsers = async (req, res) => {
  try {
    return ok(res, await new GetUser(repo).execute(req.query));
  } catch (err) {
    return serverError(res);
  }
};

const getUserById = async (req, res) => {
  try {
    return ok(res, await new GetUserById(repo).execute(req.params.id));
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 403) return forbidden(res, err.message);
    return serverError(res);
  }
};

const createUser = async (req, res) => {
  try {
    return created(res, await new CreateUser(repo).execute(req.body, req.user));
  } catch (err) {
    if (err.statusCode === 409) return conflict(res, err.message);
    if (err.statusCode === 403) return forbidden(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

const updateUser = async (req, res) => {
  try {
    return ok(res, await new UpdateUser(repo).execute(req.params.id, req.body));
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 409) return conflict(res, err.message);
    if (err.statusCode === 403) return forbidden(res, err.message);
    return serverError(res);
  }
};

const toggleStatus = async (req, res) => {
  try {
    const user = await repo.findById(req.params.id);
    if (!user) return notFound(res, "Usuario no encontrado");
    if (user.isLastActiveAdmin && user.isLastActiveAdmin(await repo.countActiveAdmins()))
      return unprocessable(res, "No se puede desactivar el único administrador activo");
    return ok(res, await repo.update(req.params.id, { estado: !user.estado }));
  } catch (err) {
    return serverError(res);
  }
};

const deleteUser = async (req, res) => {
  try {
    await new DeleteUser(repo).execute(req.params.id);
    return noContent(res);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 403) return forbidden(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

const getRoles = (req, res) => ok(res, repo.findAllRoles());
const getSedes = (req, res) => ok(res, repo.findAllSedes());

module.exports = { login, prepareWelcome, getUsers, getUserById, createUser, updateUser, toggleStatus, deleteUser, getRoles, getSedes };
