const { verify } = require("../../infrastructure/security/token_generator");
const { unauthorized, forbidden } = require("../../shared/utils/response");

const normalizeRole = (value) =>
  typeof value === "string"
    ? value.trim().toLowerCase()
    : "";

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;

  // Sin header en cualquier entorno → rechazar con 401
  if (!header || !header.startsWith("Bearer ")) {
    return unauthorized(res, "Token no proporcionado");
  }

  try {
    req.user = verify(header.split(" ")[1]);
    next();
  } catch (err) {
    const msg =
      err.name === "TokenExpiredError"
        ? "El token ha expirado"
        : "Token inválido";

    return unauthorized(res, msg);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return unauthorized(res);
  }

  const rolNombre = normalizeRole(req.user.rolNombre);
  const rolesLower = roles.map(normalizeRole);

  if (!rolNombre || !rolesLower.includes(rolNombre)) {
    return forbidden(res, "No tienes permisos para esta acción");
  }

  next();
};

module.exports = { requireAuth, requireRole };