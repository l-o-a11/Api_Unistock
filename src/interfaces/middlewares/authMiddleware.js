const { verify } = require("../../infrastructure/security/token_generator");
const { unauthorized, forbidden, serverError } = require("../../shared/utils/response");
const UserRepository = require("../../infrastructure/repositories/UserRepository");

const userRepo = new UserRepository();

const normalizeRole = (value) =>
  typeof value === "string"
    ? value.trim().toLowerCase()
    : "";

// FIX: requireAuth ya no confía ciegamente en los claims del JWT.
// Antes, un usuario desactivado (o con el rol cambiado) seguía operando
// con plenos permisos hasta que su token expirara (hasta 8h por defecto),
// porque solo se verificaba la firma del token sin volver a consultar la BD.
//
// Ahora, además de validar la firma, se busca el usuario real en Mongo y:
//   1. Si no existe o está inactivo (estado: false) → 401 inmediato,
//      sin importar que el token siga siendo válido.
//   2. Se refresca rolNombre/rolId/sedeId con el valor ACTUAL de la BD,
//      no con el que quedó "congelado" en el token al momento del login.
//      Así, si a alguien le cambian el rol a mitad de sesión, el siguiente
//      request ya se evalúa con el rol nuevo.
const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization;

  // Sin header en cualquier entorno → rechazar con 401
  if (!header || !header.startsWith("Bearer ")) {
    return unauthorized(res, "Token no proporcionado");
  }

  let claims;
  try {
    claims = verify(header.split(" ")[1]);
  } catch (err) {
    const msg =
      err.name === "TokenExpiredError"
        ? "El token ha expirado"
        : "Token inválido";

    return unauthorized(res, msg);
  }

  try {
    const liveUser = await userRepo.findById(claims.id);

    if (!liveUser || !liveUser.estado) {
      return unauthorized(res, "Tu sesión ya no es válida. Tu usuario fue desactivado.");
    }

    // req.user combina los claims del token (correo, nombreCompleto, etc.)
    // con los datos de acceso ACTUALES de la BD (estado, rol y sede reales).
    req.user = {
      ...claims,
      estado: liveUser.estado,
      rolId: liveUser.rolId,
      rolNombre: liveUser.rolNombre,
      sedeId: liveUser.sedeId,
    };
    next();
  } catch (err) {
    console.error("ERROR requireAuth (verificación contra BD):", err);
    return serverError(res, "No se pudo validar la sesión");
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