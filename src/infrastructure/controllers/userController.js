const UserRepository = require("../repositories/UserRepository");
const CreateUser = require("../../application/use-cases/users/CreateUser");
const GetUser = require("../../application/use-cases/users/GetUser");
const GetUserById = require("../../application/use-cases/users/GetUserById");
const UpdateUser = require("../../application/use-cases/users/UpdateUser");
const DeleteUser = require("../../application/use-cases/users/DeleteUser");
const LoginUser = require('../../application/use-cases/auth/LoginUser');
const ForgotPassword = require('../../application/use-cases/auth/ForgotPassword');
const VerifyCode = require('../../application/use-cases/auth/VerifyCode');
const ResetPassword = require('../../application/use-cases/auth/ResetPassword');
const ChangePassword = require('../../application/use-cases/auth/ChangePassword');
const { generatePassword } = require("../../shared/utils/generatePassword");
const {
  ok, created, noContent, notFound,
  badRequest, unauthorized, conflict, forbidden,
  unprocessable, serverError,
} = require('../../shared/utils/response');

const repo = new UserRepository();

const login = async (req, res) => {
  try {
    const result = await new LoginUser(repo).execute(req.body);
    return ok(res, result);
  } catch (err) {
    console.error("ERROR LOGIN:", err);
    if (err.statusCode === 401) return unauthorized(res, err.message);
    if (err.statusCode === 403) return forbidden(res, err.message);
    return serverError(res);
  }
};

const prepareWelcome = (req, res) => ok(res, { password: generatePassword() });

const getUsers = async (req, res) => {
  try {
    const users = await new GetUser(repo).execute(req.query, req.user);
    return ok(res, users);
  } catch (err) {
    console.error("ERROR GET USERS:", err); // ← agrega esta línea
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
    console.error("ERROR UPDATE USER:", err); // ← agrega esta línea
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
    console.error("ERROR DELETE USER:", err); // ← agrega esta línea
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 403) return forbidden(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const result = await new ForgotPassword(repo).execute(req.body);
    return ok(res, result);
  } catch (err) {
    console.error('ERROR FORGOT PASSWORD:', err);
    return serverError(res, err.message);
  }
};

const verifyCode = async (req, res) => {
  try {
    const result = await new VerifyCode().execute(req.body);
    return ok(res, result);
  } catch (err) {
    if (err.statusCode === 400) return badRequest(res, err.message);
    return serverError(res, err.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const result = await new ResetPassword(repo).execute(req.body);
    return ok(res, result);
  } catch (err) {
    if (err.statusCode === 400) return badRequest(res, err.message);
    return serverError(res, err.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const result = await new ChangePassword(repo).execute({
      userId: req.user.id,
      ...req.body,
    });
    return ok(res, result);
  } catch (err) {
    if (err.statusCode === 400) return badRequest(res, err.message);
    if (err.statusCode === 404) return notFound(res, err.message);
    return serverError(res, err.message);
  }
};

const getRoles = async (req, res) => ok(res, await repo.findAllRoles());
const getSedes = async (req, res) => ok(res, await repo.findAllSedes());

module.exports = {
  login, prepareWelcome,
  getUsers, getUserById, createUser,
  updateUser, toggleStatus, deleteUser,
  getRoles, getSedes,
  forgotPassword, verifyCode, resetPassword, changePassword,
};
