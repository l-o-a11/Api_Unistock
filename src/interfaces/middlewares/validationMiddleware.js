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
      .notEmpty().withMessage("Obligatorio")
      .isNumeric().withMessage("Solo números")
      .isLength({ min: 5, max: 15 }).withMessage("Entre 5 y 15 dígitos"),
    body("nombreCompleto")
      .notEmpty().withMessage("Obligatorio")
      .isLength({ min: 3, max: 100 }).withMessage("Entre 3 y 100 caracteres")
      .trim(),
    body("correo").isEmail().withMessage("Correo inválido").normalizeEmail(),
    body("rolId")
      .notEmpty().withMessage("Rol requerido")
      .isMongoId().withMessage("rolId inválido"),
    body("sedeId")
      .notEmpty().withMessage("Sede requerida")
      .isMongoId().withMessage("sedeId inválido"),
    body("password")
      .optional()
      .isLength({ min: 6 }).withMessage("Mínimo 6 caracteres"),
  ],

  updateUser: [
    param("id").isMongoId().withMessage("ID inválido"),
    body("tipoDocumento").optional().isIn(["CC", "TI"]),
    body("numeroDocumento")
      .optional()
      .isNumeric()
      .isLength({ min: 5, max: 15 }),
    body("nombreCompleto")
      .optional()
      .isLength({ min: 3, max: 100 }).trim(),
    body("correo").optional().isEmail().normalizeEmail(),
    body("rolId").optional().isMongoId().withMessage("rolId inválido"),
    body("sedeId").optional().isMongoId().withMessage("sedeId inválido"),
  ],

  idParam: [
    param("id").isMongoId().withMessage("ID inválido"),
  ],

  listUsers: [
    query("rolId").optional().isMongoId(),
    query("sedeId").optional().isMongoId(),
    query("estado").optional().isIn(["true", "false"]),
  ],

  login: [
    body("correo").isEmail().withMessage("Correo inválido").normalizeEmail(),
    body("password").notEmpty().withMessage("Contraseña requerida"),
  ],

  forgotPassword: [
    body('correo').isEmail().withMessage('Correo inválido').normalizeEmail(),
  ],

  verifyCode: [
    body('correo').isEmail().withMessage('Correo inválido').normalizeEmail(),
    body('codigo')
      .notEmpty().withMessage('Código requerido')
      .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos')
      .isNumeric().withMessage('El código solo debe contener números'),
  ],

  resetPassword: [
    body('resetToken').notEmpty().withMessage('Token requerido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
    body('confirmarPassword').notEmpty().withMessage('Confirmar contraseña requerida'),
  ],

  changePassword: [
    body('passwordActual').notEmpty().withMessage('Contraseña actual requerida'),
    body('passwordNueva').notEmpty().withMessage('Nueva contraseña requerida'),
    body('confirmarPassword').notEmpty().withMessage('Confirmar contraseña requerida'),
  ],
};

module.exports = { validate, rules };