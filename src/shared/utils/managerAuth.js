const bcrypt = require("bcryptjs");

const isManagerOrAdmin = (rolNombre) => {
  const role = typeof rolNombre === "string" ? rolNombre.trim().toLowerCase() : "";
  return role === "gerente" || role === "administrador";
};

const extractManagerPassword = (req) =>
  req.body?.password ||
  req.body?.managerPassword ||
  req.body?.adminPassword ||
  req.body?.data?.password ||
  req.body?.data?.managerPassword ||
  req.body?.data?.adminPassword ||
  req.query?.password ||
  req.query?.managerPassword ||
  req.query?.adminPassword ||
  req.headers["x-manager-password"] ||
  req.headers["x-admin-password"] ||
  req.headers["x-password"] ||
  req.headers.password;

const verifyManagerPassword = async (userRepo, userId, plainPassword) => {
  if (plainPassword === undefined || plainPassword === null) return false;

  const candidate = String(plainPassword).trim();
  if (!candidate) return false;

  const user = await userRepo.findById(userId);
  if (user && user.password) {
    return bcrypt.compare(candidate, user.password);
  }

  if (process.env.NODE_ENV !== "production") {
    const fallbackPassword = process.env.DEV_ADMIN_PASSWORD || "admin123";
    return candidate === fallbackPassword;
  }

  return false;
};

module.exports = {
  isManagerOrAdmin,
  extractManagerPassword,
  verifyManagerPassword,
};
