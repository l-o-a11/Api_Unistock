const UserRepository    = require("../repositories/UserRepository");
const CreateUser        = require("../../application/use-cases/users/CreateUser");
const GetUser           = require("../../application/use-cases/users/GetUser");
const GetUserById       = require("../../application/use-cases/users/GetUserById");
const UpdateUser        = require("../../application/use-cases/users/UpdateUser");
const DeleteUser        = require("../../application/use-cases/users/DeleteUser");
const LoginUser         = require("../../application/use-cases/users/LoginUser");
const { generatePassword } = require("../../shared/utils/generatePassword");
const {
  ok, created, noContent,
  notFound, conflict, unprocessable,
  unauthorized, forbidden, serverError,
} = require("../../shared/utils/response");

const repo = new UserRepository();

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

const getUsers = async (req, res) => {
  try {
    const users = await new GetUser(repo).execute(req.query, req.user);
    return ok(res, users);
  } catch (err) {
    return serverError(res);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await new GetUserById(repo).execute(req.params.id, req.user);
    return ok(res, user);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 403) return forbidden(res, err.message);
    return serverError(res);
  }
};

const createUser = async (req, res) => {
  try {
    const user = await new CreateUser(repo).execute(req.body, req.user);
    return created(res, user);
  } catch (err) {
    if (err.statusCode === 409) return conflict(res, err.message);
    if (err.statusCode === 403) return forbidden(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await new UpdateUser(repo).execute(req.params.id, req.body, req.user);
    return ok(res, user);
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

    // Admin no puede tocar usuarios de otra sede
    if (req.user.rolNombre !== "Gerente" &&
        user.sedeId.toString() !== req.user.sedeId.toString()) {
      return forbidden(res, "No puedes modificar usuarios de otra sede");
    }

    const updated = await repo.update(req.params.id, { estado: !user.estado });
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const deleteUser = async (req, res) => {
  try {
    await new DeleteUser(repo).execute(req.params.id, req.user);
    return noContent(res);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 403) return forbidden(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

const getRoles = (req, res) => ok(res, []);   // TODO: cuando roles esté en dev
const getSedes = (req, res) => ok(res, []);   // TODO: cuando sedes esté en dev

module.exports = {
  login, prepareWelcome,
  getUsers, getUserById, createUser,
  updateUser, toggleStatus, deleteUser,
  getRoles, getSedes,
};