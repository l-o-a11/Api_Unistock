const { verify } = require("../../infrastructure/security/token_generator");
const { unauthorized, forbidden } = require("../../shared/utils/response");

const normalizeRole = (value) =>
  typeof value === "string"
    ? value.trim().toLowerCase()
    : "";

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (process.env.NODE_ENV !== "production" && (!header || !header.startsWith("Bearer "))) {
    req.user = {
      id: "000000000000000000000001",
      nombre: "Dev User",
      rolNombre: "Administrador",
      sedeId: null,
    };
    return next();
  }

  try {
    req.user = verify(header.split(" ")[1]);
    console.log("TOKEN DECODIFICADO:", req.user);
    next();
  } catch (err) {
    const msg = err.name === "TokenExpiredError"
      ? "El token ha expirado"
      : "Token inválido";
    return unauthorized(res, msg);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return unauthorized(res);

  const rolNombre = normalizeRole(req.user.rolNombre);
  const rolesLower = roles.map(normalizeRole);

  console.log("ROL DEL USUARIO:", rolNombre);
  console.log("ROLES PERMITIDOS:", rolesLower);

  if (!rolNombre || !rolesLower.includes(rolNombre)) {
    return forbidden(res, "No tienes permisos para esta acción");
  }
  next();
};

module.exports = { requireAuth, requireRole };