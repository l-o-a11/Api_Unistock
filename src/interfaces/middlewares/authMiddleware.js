const { verify } = require("../../infrastructure/security/token_generator");
const { unauthorized, forbidden } = require("../../shared/utils/response");

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return unauthorized(res, "Token requerido");
  }

  try {
    req.user = verify(header.split(" ")[1]);
    next();
  } catch (err) {
    const msg = err.name === "TokenExpiredError"
      ? "El token ha expirado"
      : "Token inválido";
    return unauthorized(res, msg);
  }
};

// rolNombres: ["Gerente", "Administrador", "Empleado"]
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return unauthorized(res);
  if (!roles.includes(req.user.rolNombre)) {
    return forbidden(res, "No tienes permisos para esta acción");
  }
  next();
};

module.exports = { requireAuth, requireRole };