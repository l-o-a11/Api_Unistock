const { compare } = require("../../infrastructure/security/password_encrypter");
const UserRepository = require("../repositories/UserRepository");
const RoleRepository = require("../repositories/RoleRepository");
const SiteRepository = require("../repositories/SiteRepository");
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
const roleRepo = new RoleRepository();
const siteRepo = new SiteRepository();

const login = async (req, res) => {
  try {
    // LoginUser necesita roleRepository para verificar el rol sin importar RoleModel
    const result = await new LoginUser(repo, roleRepo).execute(req.body);
    return ok(res, result);
  } catch (err) {
    console.error("ERROR LOGIN:", err);
    if (err.statusCode === 401) return unauthorized(res, err.message);
    if (err.statusCode === 403) return forbidden(res, err.message);
    return serverError(res);
  }
};

const prepareWelcome = (req, res) => ok(res, { password: generatePassword() });

const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return badRequest(res, "La contraseña es requerida");

    // findByIdWithPassword garantiza que el hash está presente en la entidad
    const user = await repo.findByIdWithPassword(req.user.id);
    if (!user) return unauthorized(res, "Usuario no encontrado");

    // compare ya está importado al tope del archivo — no re-importar aquí
    const match = await compare(password, user.password);
    if (!match) return unauthorized(res, "Contraseña incorrecta");

    return ok(res, { valid: true });
  } catch (err) {
    return serverError(res, err.message);
  }
};

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
    return created(res, await new CreateUser(repo, roleRepo, siteRepo).execute(req.body, req.user));
  } catch (err) {
    if (err.statusCode === 409) return conflict(res, err.message);
    if (err.statusCode === 403) return forbidden(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    return serverError(res);
  }
};

const updateUser = async (req, res) => {
  try {
    return ok(res, await new UpdateUser(repo, roleRepo, siteRepo).execute(req.params.id, req.body));
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

    const updated = await repo.update(req.params.id, { estado: !user.estado });
    // FIX: repo.update() devuelve la entidad User con password incluido.
    // Llamar toPublic() antes de responder para nunca exponer el hash bcrypt.
    return ok(res, updated.toPublic ? updated.toPublic() : updated);
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

// PUT /auth/profile — el usuario autenticado actualiza sus propios datos
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombreCompleto, correo } = req.body;
    const changes = {};
    if (nombreCompleto) changes.nombreCompleto = nombreCompleto.trim();
    if (correo) changes.correo = correo;
    const updated = await new UpdateUser(repo, roleRepo, siteRepo).execute(userId, changes);
    return ok(res, updated);
  } catch (err) {
    if (err.statusCode === 409) return conflict(res, err.message);
    if (err.statusCode === 404) return notFound(res, err.message);
    return serverError(res);
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
  forgotPassword, verifyCode, resetPassword, changePassword, verifyPassword, updateProfile,
};