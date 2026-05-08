const { verify } = require("../../infrastructure/security/token_generator");
const { unauthorized, forbidden } = require("../../shared/utils/response");

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (process.env.NODE_ENV !== "production" && (!header || !header.startsWith("Bearer "))) {
    req.user = { id: "000000000000000000000001", nombre: "Dev User" };
    return next();
  }

  try {
    req.user = verify(header.split(" ")[1]);
    console.log("TOKEN DECODIFICADO:", req.user); // ← agrega esta línea
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
  const rolNombre = req.user.rolNombre?.toLowerCase();
  const rolesLower = roles.map(r => r.toLowerCase());
  console.log("ROL DEL USUARIO:", rolNombre);
  console.log("ROLES PERMITIDOS:", rolesLower);
  if (!rolesLower.includes(rolNombre)) {
    return forbidden(res, "No tienes permisos para esta acción");
  }
  next();
};

module.exports = { requireAuth, requireRole };