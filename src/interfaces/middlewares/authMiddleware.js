// interfaces/middlewares/authMiddleware.js
// Verifica el JWT en el header Authorization.
// requireRole(...roles) comprueba que el usuario tenga el rolId correcto.

const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token requerido" });
  }

  try {
    const token = header.split(" ")[1];
    const secret = (process.env.JWT_SECRET || "unistock_secret").trim();
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Token invalido o expirado" });
  }
};

// Uso: requireRole(2)  →  solo administradores
// Uso: requireRole(1, 2)  →  empleados y administradores
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.rolId)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "No tienes permisos para esta accion",
        });
    }
    next();
  };

module.exports = { requireAuth, requireRole };