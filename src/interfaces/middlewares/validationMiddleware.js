const { body, param, query, validationResult } = require("express-validator");
const { badRequest } = require("../../shared/utils/response");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return badRequest(
      res,
      "Datos inválidos",
      errors.array().map((e) => ({ field: e.path, message: e.msg })),
    );
  }
  next();
};

const rules = {
  createUser: [
    body("tipoDocumento").isIn(["CC", "TI"]).withMessage("Debe ser CC o TI"),
    body("numeroDocumento")
      .notEmpty()
      .withMessage("Obligatorio")
      .isNumeric()
      .withMessage("Solo números")
      .isLength({ min: 5, max: 15 })
      .withMessage("Entre 5 y 15 dígitos"),
    body("nombreCompleto")
      .notEmpty()
      .withMessage("Obligatorio")
      .isLength({ min: 3, max: 100 })
      .withMessage("Entre 3 y 100 caracteres")
      .trim(),
    body("correo").isEmail().withMessage("Correo inválido").normalizeEmail(),
    body("rolId").isInt({ min: 1 }).withMessage("Rol requerido"),
    body("sedeId").isInt({ min: 1 }).withMessage("Sede requerida"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Mínimo 6 caracteres"),
  ],

  updateUser: [
    param("id").isInt({ min: 1 }).withMessage("ID inválido"),
    body("tipoDocumento").optional().isIn(["CC", "TI"]),
    body("numeroDocumento")
      .optional()
      .isNumeric()
      .isLength({ min: 5, max: 15 }),
    body("nombreCompleto").optional().isLength({ min: 3, max: 100 }).trim(),
    body("correo").optional().isEmail().normalizeEmail(),
    body("rolId").optional().isInt({ min: 1 }),
    body("sedeId").optional().isInt({ min: 1 }),
  ],

  idParam: [param("id").isInt({ min: 1 }).withMessage("ID inválido")],

  listUsers: [
    query("rolId").optional().isInt({ min: 1 }),
    query("sedeId").optional().isInt({ min: 1 }),
    query("estado").optional().isIn(["true", "false"]),
  ],

  login: [
    body("correo").isEmail().withMessage("Correo inválido").normalizeEmail(),
    body("password").notEmpty().withMessage("Contraseña requerida"),
  ],
};

module.exports = { validate, rules };